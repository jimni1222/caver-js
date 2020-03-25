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
const Keyring = require('../caver-klaytn-keyring/keyring')

class Wallet {
    constructor(keyrings) {
        keyrings = keyrings || []
        this._length = 0
        this._addressToIndex = new Map()
        this._setInitialState(keyrings)
    }

    _setInitialState(keyrings) {
        for (const keyring of keyrings) {
            this.add(keyring)
        }
    }

    _findSafeIndex(pointer) {
        pointer = pointer || 0
        if (_.has(this, pointer)) {
            return this._findSafeIndex(pointer + 1)
        }
        return pointer
    }

    _currentIndexes() {
        const keys = Object.keys(this)
        const indexes = keys
            .map(function(key) {
                return parseInt(key)
            })
            .filter(function(n) {
                return n < 9e20
            })

        return indexes
    }

    create(numberOfAccounts, entropy) {
        for (let i = 0; i < numberOfAccounts; ++i) {
            this.add(Keyring.generate(entropy))
        }
        return this
    }

    add(keyring) {
        if (this._addressToIndex.get(keyring.getAddress().toLowerCase()) !== undefined)
            throw new Error(`Duplicate Account ${keyring.getAddress()}`)

        const keyringToAdd = keyring.copy()

        keyringToAdd.index = this._findSafeIndex()
        this[keyringToAdd.index] = keyringToAdd

        this._length++
        this._addressToIndex.set(keyringToAdd.getAddress().toLowerCase(), keyringToAdd.index)

        return this[keyringToAdd.index]
    }

    updateKeyring(keyring) {
        const idx = this._addressToIndex.get(keyring.getAddress().toLowerCase())
        if (idx === undefined) throw new Error(`Failed to find keyring to update`)

        this[idx].key = keyring.key
        return this[idx]
    }

    getKeyring(address) {
        return this[this._addressToIndex.get(address.toLowerCase())]
    }

    getLength() {
        return this._length
    }

    signWithKey(address, transactionHash, chainId, role, index) {
        const keyring = this.getKeyring(address)
        if (!keyring) throw new Error(`Failed to find keyring in wallet`)
        return keyring.signWithKey(transactionHash, chainId, role, index)
    }

    signWithKeys(address, transactionHash, chainId, role) {
        const keyring = this.getKeyring(address)
        if (!keyring) throw new Error(`Failed to find keyring in wallet`)
        return keyring.signWithKey(transactionHash, chainId, role)
    }
}

module.exports = Wallet
