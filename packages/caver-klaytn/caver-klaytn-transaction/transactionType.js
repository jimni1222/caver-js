/*
    Copyright 2020 The caver-js Authors
    This file is part of the caver-js library.

    The caver-js library is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    The caver-js library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with the caver-js. If not, see <http://www.gnu.org/licenses/>.
*/

const _ = require('lodash')
const Bytes = require('eth-lib/lib/bytes')
const RLP = require('eth-lib/lib/rlp')
const Hash = require('eth-lib/lib/hash')
const Signer = require('../caver-klaytn-signer/signer')
const utils = require('../../caver-utils')
const formatters = require('../../caver-core-helpers/src/formatters')
const Keyring = require('../caver-klaytn-keyring/keyring')
const { refineSignatures } = require('./transactionHelper/transacitonHelper')

class TransactionType {
    static async getGasPrice() {
        return TransactionType._klaytnCall.getGasPrice()
    }

    static async getNonce(address) {
        return TransactionType._klaytnCall.getTransactionCount(address)
    }

    static async getChainId() {
        return TransactionType._klaytnCall.getChainId()
    }

    constructor(typeString, typeTag, createTxObj) {
        this.type = typeString
        this.tag = typeTag
        this.nonce = createTxObj.nonce
        this.gas = createTxObj.gas
        this.gasPrice = createTxObj.gasPrice
        this.signatures = createTxObj.signatures || []
    }

    // keyOrKeyring can be keyring or key string
    async signWithKey(keyOrKeyring, index = 0) {
        let keyring = keyOrKeyring
        if (_.isString(keyOrKeyring)) {
            if (index !== 0) throw new Error(`Single key cannot sign with index.`)
            keyring = Keyring.fromPrivateKey(keyOrKeyring)
        }

        if (!this.from) this.from = keyring.address

        await fillAndForamtTransaction(this)
        return Signer.signWithKey(this, keyring, index)
    }

    async signWithKeys(keyring) {
        if (!this.from) this.from = keyring.address
        await fillAndForamtTransaction(this)
        return Signer.signWithKeys(this, keyring)
    }

    // wallet can be wallet or KMS module
    async signWithKeyByWallet(wallet, address, index = 0) {
        if (!this.from) this.from = address
        await fillAndForamtTransaction(this)
        return Signer.signWithKeyByWallet(this, wallet, address, index)
    }

    // wallet can be wallet or KMS module
    async signWithKeysByWallet(wallet, address) {
        if (!this.from) this.from = address
        await fillAndForamtTransaction(this)
        return Signer.signWithKeysByWallet(this, wallet, address)
    }

    appendSignatures(sig) {
        if (!Array.isArray(sig[0])) sig = [sig]
        this.signatures = refineSignatures(this.signatures.concat(sig))
    }

    combineSignatures(rlpEncodedTransactions) {}

    getRLPEncodingForSigning() {
        return RLP.encode([this._getCommonRLPEncodingForSigning(), Bytes.fromNat(this.chainId || '0x1'), '0x', '0x'])
    }

    getHashForSigning() {
        const rlpEncoded = this.getRLPEncodingForSigning()
        return Hash.keccak256(rlpEncoded)
    }

    getTransactionHash(rlpEncoded = this.getRLPEncoding()) {
        return Hash.keccak256(rlpEncoded)
    }

    getSenderTxHash(rlpEncoded = this.getRLPEncoding()) {
        if (!this.type.includes('FEE_DELEGATED')) return Hash.keccak256(rlpEncoded)

        const type = rlpEncoded.slice(0, 4)
        const typeDetached = `0x${rlpEncoded.slice(4)}`

        const data = RLP.decode(typeDetached)

        return Hash.keccak256(type + RLP.encode(data.slice(0, data.length - 2)).slice(2))
    }
}

async function fillAndForamtTransaction(transaction) {
    transaction.gasPrice = transaction.gasPrice === undefined ? await TransactionType.getGasPrice() : transaction.gasPrice
    transaction.nonce = transaction.nonce === undefined ? await TransactionType.getNonce(transaction.from) : transaction.nonce
    transaction.chainId = transaction.chainId === undefined ? await TransactionType.getChainId() : transaction.chainId

    if (transaction.type === 'LEGACY' || transaction.type.includes('SMART_CONTRACT_DEPLOY')) {
        transaction.to = transaction.to || '0x'
        transaction.data = utils.addHexPrefix(transaction.data || '0x')
    }
    transaction.chainId = utils.numberToHex(transaction.chainId)

    formatters.inputTransactionFormatter(transaction)
}

module.exports = { TransactionType, fillAndForamtTransaction }
