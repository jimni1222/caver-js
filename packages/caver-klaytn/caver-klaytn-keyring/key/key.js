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

const AccountLib = require('eth-lib/lib/account')
const Nat = require('eth-lib/lib/nat')

const elliptic = require('elliptic')

const secp256k1 = new elliptic.ec('secp256k1')

const utils = require('../../../caver-utils/src')

class Key {
    static generate(entropy) {
        return new Key(AccountLib.create(entropy || utils.randomHex(32)).privateKey)
    }

    constructor(key) {
        if (!utils.isValidPrivateKey(key)) throw new Error(`Invalid private key: ${key}`)

        let privateKey = utils.addHexPrefix(key)
        Object.defineProperty(this, 'privateKey', {
            get: function() {
                return privateKey
            },
            set: function(newPrivateKey) {
                if (!utils.isValidPrivateKey(privateKey)) throw new Error(`Invalid private key: ${privateKey}`)
                privateKey = utils.addHexPrefix(newPrivateKey)
            },
            enumerable: true,
        })
    }

    signWithKey(transactionHash, chainId) {
        const signature = AccountLib.makeSigner(Nat.toNumber(chainId || '0x1') * 2 + 35)(transactionHash, this.privateKey)
        const [v, r, s] = AccountLib.decodeSignature(signature).map(sig => utils.makeEven(utils.trimLeadingZero(sig)))
        return [v, r, s]
    }

    getPublicKey(compressed = false) {
        const strippedPrivateKey = utils.stripHexPrefix(this.privateKey)

        const ecKey = secp256k1.keyFromPrivate(Buffer.from(strippedPrivateKey, 'hex'))

        if (!compressed) return `0x${ecKey.getPublic(false, 'hex').slice(2)}`
        return `0x${ecKey.getPublic(true, 'hex')}`
    }

    getDerivedAddress() {}
}

module.exports = Key
