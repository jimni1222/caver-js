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

const utils = require('../../caver-utils')
const AccountKeyDecoder = require('./accountKey/accountKeyDecoder')
// const AccountKeyLegacy = require('./accountKey/accountKeyLegacy')
const AccountKeyPublic = require('./accountKey/accountKeyPublic')
const AccountKeyWeightedMultiSig = require('./accountKey/accountKeyWeightedMultiSig')
const WeightedPublicKey = require('./accountKey/weightedPublicKey')

class Account {
    static fromRLPEncodedKey(address, rlpEncodedKey) {
        const accountKey = AccountKeyDecoder.decode(rlpEncodedKey)
        return new Account(address, accountKey)
    }

    static fromSinglePublicKey(address, publicKey) {
        return new Account(address, new AccountKeyPublic(publicKey))
    }

    static fromMultiplePublicKey(address, publicKeyArray, options) {
        const weightedPublicKeys = []
        for (let i = 0; i < publicKeyArray.length; i++) {
            const weightedPublicKey = new WeightedPublicKey(options.weight[i], publicKeyArray[i])
            weightedPublicKeys.push(weightedPublicKey)
        }
        return new Account(address, new AccountKeyWeightedMultiSig(options.threshold, weightedPublicKeys))
    }

    // static fromRoleBasedPublicKey(address, roledBasedPublicKeyArray, options) {
    //     return new Account(address, new AccountKeyPublic(publicKeyString))
    // }

    constructor(address, accountKey) {
        this._address = address
        this._accountKey = accountKey
    }

    getAdderess() {
        return this._address
    }

    setAddress(addressInput) {
        if (!utils.isAddress(addressInput)) throw new Error(`Invalid address : ${addressInput}`)

        this._address = utils.addHexPrefix(addressInput)
    }

    getAccountKey() {
        return this._accountKey
    }

    setAccountKey(accountKey) {
        this._accountKey = accountKey
    }

    getRLPEncodedKey() {
        return this._accountKey.getRLPEncodedKey()
    }
}

module.exports = Account
