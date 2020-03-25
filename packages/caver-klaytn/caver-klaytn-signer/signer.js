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
const { KEY_ROLE } = require('../caver-klaytn-keyring/keyRole')
const Keyring = require('../caver-klaytn-keyring/keyring')
const SigningResult = require('./signingResult')

class Signer {
    static async signWithKey(transaction, keyParam, index = 0) {
        return _signAsSender(transaction, keyParam, index)
    }

    static async signWithKeys(transaction, keyParam) {
        return _signAsSender(transaction, keyParam)
    }

    static async signFeePayerWithKey(transaction, keyParam, index = 0) {
        return _signAsFeePayer(transaction, keyParam, index)
    }

    static async signFeePayerWithKeys(transaction, keyParam) {
        return _signAsFeePayer(transaction, keyParam)
    }

    static async signWithKeyByWallet(transaction, wallet, address, index = 0) {
        return _signAsSenderByWallet(transaction, wallet, address, index)
    }

    static async signWithKeysByWallet(transaction, wallet, address) {
        return _signAsSenderByWallet(transaction, wallet, address)
    }

    static async signFeePayerWithKeyByWallet(transaction, wallet, address, index = 0) {
        return _signAsFeePayerByWallet(transaction, wallet, address, index)
    }

    static async signFeePayerWithKeysByWallet(transaction, wallet, address) {
        return _signAsFeePayerByWallet(transaction, wallet, address)
    }
}

function _signAsSender(transaction, keyParam, index) {
    if (transaction.type === 'LEGACY' && transaction.signatures.length !== 0) {
        throw new Error(`Legacy transaction cannot signed with multiple keys`)
    }

    const role = transaction.type.includes('ACCOUNT_UPDATE') ? KEY_ROLE.ROLE_ACCOUNT_UPDATE_KEY : KEY_ROLE.ROLE_TRANSACTION_KEY

    const messageHash = transaction.getHashForSigning()

    const sigs = _sign(keyParam, messageHash, transaction.chainId, role, index)
    transaction.appendSignatures(sigs)

    return new SigningResult(transaction, messageHash)
}

function _signAsSenderByWallet(transaction, wallet, address, index) {
    if (transaction.type === 'LEGACY' && transaction.signatures.length !== 0) {
        throw new Error(`Legacy transaction cannot signed with multiple keys`)
    }

    const role = transaction.type.includes('ACCOUNT_UPDATE') ? KEY_ROLE.ROLE_ACCOUNT_UPDATE_KEY : KEY_ROLE.ROLE_TRANSACTION_KEY

    const messageHash = transaction.getHashForSigning()

    const sigs = _signByWallet(wallet, address, messageHash, transaction.chainId, role, index)
    transaction.appendSignatures(sigs)

    return new SigningResult(transaction, messageHash)
}

function _signAsFeePayer(transaction, keyParam, index) {
    const role = KEY_ROLE.ROLE_FEE_PAYER_KEY

    const messageHash = transaction.getHashForFeePayerSigning()

    const feePayerSig = _sign(keyParam, messageHash, transaction.chainId, role, index)
    transaction.appendFeePayerSignatures(feePayerSig)

    return new SigningResult(transaction, messageHash)
}

function _signAsFeePayerByWallet(transaction, wallet, address, index) {
    const role = KEY_ROLE.ROLE_FEE_PAYER_KEY

    const messageHash = transaction.getHashForFeePayerSigning()

    const feePayerSig = _signByWallet(wallet, address, messageHash, transaction.chainId, role, index)
    transaction.appendFeePayerSignatures(feePayerSig)

    return new SigningResult(transaction, messageHash)
}

function _sign(keyringOrkeyString, messageHash, chainId, role, index) {
    let keyring = keyringOrkeyString

    if (_.isString(keyringOrkeyString)) {
        keyring = Keyring.fromPrivateKey(keyringOrkeyString)
    }

    const signature =
        index !== undefined ? keyring.signWithKey(messageHash, chainId, role, index) : keyring.signWithKeys(messageHash, chainId, role)

    return signature
}

function _signByWallet(wallet, address, messageHash, chainId, role, index) {
    const signature =
        index !== undefined
            ? wallet.signWithKey(address, messageHash, chainId, role, index)
            : wallet.signWithKeys(address, messageHash, chainId, role)

    return signature
}

module.exports = Signer
