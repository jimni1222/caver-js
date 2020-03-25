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
const RLP = require('eth-lib/lib/rlp')
const Bytes = require('eth-lib/lib/bytes')
const { TransactionType } = require('../transactionType')
const { TX_TYPE_ENUM } = require('../transactionHelper/transacitonHelper')
const utils = require('../../../caver-utils/src')

class LegacyTransaction extends TransactionType {
    static decode(rlpEncoded) {
        const [nonce, gasPrice, gas, to, value, data, v, r, s] = RLP.decode(rlpEncoded)
        return new LegacyTransaction({
            nonce,
            gasPrice,
            gas,
            to,
            value,
            data,
            signatures: [v, r, s],
        })
    }

    constructor(createTxObj) {
        if (_.isString(createTxObj)) createTxObj = LegacyTransaction.decode(createTxObj)
        super(TX_TYPE_ENUM.LEGACY, TX_TYPE_ENUM.LEGACY_TYPE_TAG, createTxObj)
        this.to = createTxObj.to || '0x'
        this.data = utils.addHexPrefix(createTxObj.data) || '0x'
        this.value = createTxObj.value
    }

    async appendSignatures(sig) {
        if (this.signatures && this.signatures.length > 0) throw new Error(`Legacy transaction cannot include more than two signatures`)

        if (Array.isArray(sig[0])) {
            if (sig.length > 1) throw new Error(`Legacy transaction cannot include more than two signatures`)
            sig = sig[0]
        }

        this.signatures = sig
    }

    getRLPEncodingForSigning() {
        return RLP.encode([
            Bytes.fromNat(this.nonce),
            Bytes.fromNat(this.gasPrice),
            Bytes.fromNat(this.gas),
            this.to.toLowerCase(),
            Bytes.fromNat(this.value),
            this.data,
            Bytes.fromNat(this.chainId || '0x1'),
            '0x',
            '0x',
        ])
    }

    getRLPEncoding() {
        return `0x${RLP.encode([
            Bytes.fromNat(this.nonce),
            Bytes.fromNat(this.gasPrice),
            Bytes.fromNat(this.gas),
            this.to.toLowerCase(),
            Bytes.fromNat(this.value),
            this.data,
            this.signatures[0],
            this.signatures[1],
            this.signatures[2],
        ]).slice(2)}`
    }
}

module.exports = LegacyTransaction
