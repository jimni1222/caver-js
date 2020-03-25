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
const AccountLib = require('eth-lib/lib/account')
const utils = require('../../caver-utils/src')
const Key = require('./key/key')
const { KEY_ROLE } = require('./keyRole')
const Account = require('../caver-klaytn-account/account')
const WeightedMultiSig = require('../caver-klaytn-account/accountKey/weightedPublicKey')

function generateKeysFormat() {
    return Array(KEY_ROLE.ROLE_LAST)
        .fill(null)
        .map(() => [])
}

function fillRoleKey(keys, role, keyToAdd) {
    if (keyToAdd === undefined) return
    keyToAdd = Array.isArray(keyToAdd) ? keyToAdd : [keyToAdd]

    for (const keyString of keyToAdd) {
        const key = keyString instanceof Key ? keyString : new Key(keyString)
        keys[role].push(key)
    }
}

class Keyring {
    static generate(entropy) {
        const random = AccountLib.create(entropy || utils.randomHex(32))
        return Keyring.fromSingleKey(random.address, random.privateKey)
    }

    static fromPrivateKey(privateKey) {
        if (utils.isKlaytnWalletKey(privateKey)) return Keyring.fromKlaytnWalletKey(privateKey)

        const acct = AccountLib.fromPrivate(utils.addHexPrefix(privateKey))
        return Keyring.fromSingleKey(acct.address, acct.privateKey)
    }

    static fromKlaytnWalletKey(klaytnWalletKey) {
        const parsed = utils.parsePrivateKey(klaytnWalletKey)
        return Keyring.fromSingleKey(parsed.address, parsed.privateKey)
    }

    static fromSingleKey(address, key) {
        const keys = generateKeysFormat()
        fillRoleKey(keys, KEY_ROLE.ROLE_TRANSACTION_KEY, key)
        return new Keyring(address, keys)
    }

    static fromMultipleKey(address, keyArray) {
        const keys = generateKeysFormat()
        fillRoleKey(keys, KEY_ROLE.ROLE_TRANSACTION_KEY, keyArray)
        return new Keyring(address, keys)
    }

    static fromRoleBasedKey(address, roledBasedKeyArray) {
        const keys = generateKeysFormat()
        for (let i = 0; i < KEY_ROLE.ROLE_LAST; i++) {
            fillRoleKey(keys, i, roledBasedKeyArray[i])
        }

        return new Keyring(address, keys)
    }

    constructor(address, key) {
        this._address = address
        this._key = key
    }

    getAddress() {
        return this._address
    }

    setAddress(addressInput) {
        if (!utils.isAddress(addressInput)) throw new Error(`Invalid address : ${addressInput}`)

        this._address = utils.addHexPrefix(addressInput)
    }

    getKey() {
        return this._key
    }

    setKey(keyInput) {
        if (keyInput instanceof Key || _.isString(keyInput)) {
            keyInput = [[keyInput], [], []]
        } else if (_.isArray(keyInput) && !_.isArray(keyInput[0])) {
            keyInput = [keyInput, [], []]
        }
        const keys = generateKeysFormat()
        for (let i = 0; i < KEY_ROLE.ROLE_LAST; i++) {
            fillRoleKey(keys, i, keyInput[i])
        }
        this._key = keys
    }

    copy() {
        return new Keyring(this.getAddress(), this.key)
    }

    signWithKey(transactionHash, chainId, role, index = 0) {
        return this.getKeyByRole(role)[index].signWithKey(transactionHash, chainId)
    }

    signWithKeys(transactionHash, chainId, role) {
        const signatures = []

        for (const key of this.getKeyByRole(role)) {
            signatures.push(key.signWithKey(transactionHash, chainId))
        }

        return signatures
    }

    getKeyByRole(role) {
        let key = this.key[role]
        if (key.length === 0 && role > KEY_ROLE.ROLE_TRANSACTION_KEY) {
            if (this.key[KEY_ROLE.ROLE_TRANSACTION_KEY].length === 0) throw new Error(`Cannot find default roleTransactionKey`)
            key = this.key[KEY_ROLE.ROLE_TRANSACTION_KEY]
        }
        return key
    }

    toAccount(options) {
        let isRoleBased = false
        let isWeightedMultiSig = false

        for (let i = KEY_ROLE.ROLE_LAST - 1; i > KEY_ROLE.ROLE_TRANSACTION_KEY; i--) {
            if (this.getKey()[i].length > 0) {
                isRoleBased = true
                break
            }
        }

        if (!isRoleBased && this.getKey()[KEY_ROLE.ROLE_TRANSACTION_KEY].length > 0) isWeightedMultiSig = true

        if (isRoleBased) {
        } else if (isWeightedMultiSig) {
            if (_.isArray(options)) options = options[0]

            const publicKeys = []
            for (const prv of this.getKey()[KEY_ROLE.ROLE_TRANSACTION_KEY]) {
                publicKeys.push(prv.getPublicKey())
            }

            return Account.fromMultiplePublicKey(this.getAddress(), publicKeys, options)
        }
        const publicKeyString = this.getKey()[0][0].getPublicKey()
        return Account.fromSinglePublicKey(this.getAddress(), publicKeyString)
    }
}

module.exports = Keyring
