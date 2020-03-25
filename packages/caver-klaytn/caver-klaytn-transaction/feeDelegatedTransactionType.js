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
const Hash = require('eth-lib/lib/hash')
const Bytes = require('eth-lib/lib/bytes')
const RLP = require('eth-lib/lib/rlp')
const Signer = require('../caver-klaytn-signer/signer')
const { TransactionType, fillAndForamtTransaction } = require('./transactionType')
const { refineSignatures } = require('./transactionHelper/transacitonHelper')
const Keyring = require('../caver-klaytn-keyring/keyring')

class FeeDelegatedTransactionType extends TransactionType {
    constructor(typeString, typeTag, createTxObj) {
        super(typeString, typeTag, createTxObj)
        this.feePayer = createTxObj.feePayer || '0x'
        this.feePayerSignatures = createTxObj.feePayerSignatures || []
    }

    async signFeePayerWithKey(keyOrKeyring, index = 0) {
        if (!this.feePayer || this.feePayer === '0x')
            throw new Error(`Invalid fee payer ${this.feePayer}. Please set fee payer in transaction first before signing`)

        let keyring = keyOrKeyring
        if (_.isString(keyOrKeyring)) {
            if (index !== 0) throw new Error(`Single key cannot sign with index.`)
            keyring = Keyring.fromPrivateKey(keyOrKeyring)
        }
        await fillAndForamtTransaction(this)
        return Signer.signFeePayerWithKey(this, keyring, index)
    }

    async signFeePayerWithKeys(keyring) {
        if (!this.feePayer || this.feePayer === '0x')
            throw new Error(`Invalid fee payer ${this.feePayer}. Please set fee payer in transaction first before signing`)

        await fillAndForamtTransaction(this)
        return Signer.signFeePayerWithKeys(this, keyring)
    }

    appendFeePayerSignatures(sig) {
        if (!Array.isArray(sig[0])) sig = [sig]
        this.feePayerSignatures = refineSignatures(this.feePayerSignatures.concat(sig))
    }

    getRLPEncodingForFeePayerSigning() {
        return RLP.encode([
            this._getCommonRLPEncodingForSigning(),
            this.feePayer.toLowerCase(),
            Bytes.fromNat(this.chainId || '0x1'),
            '0x',
            '0x',
        ])
    }

    getHashForFeePayerSigning() {
        const rlpEncoded = this.getRLPEncodingForFeePayerSigning()
        return Hash.keccak256(rlpEncoded)
    }
}

module.exports = FeeDelegatedTransactionType
