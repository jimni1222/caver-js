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
const Account = require('../../caver-klaytn-account/account')

function _decode(rlpEncoded) {
    const typeDettached = `0x${rlpEncoded.slice(4)}`
    const [nonce, gasPrice, gas, from, rlpEncodedKey, signatures] = RLP.decode(typeDettached)
    return {
        nonce,
        gasPrice,
        gas,
        from,
        rlpEncodedKey,
        signatures,
    }
}
class AccountUpdate extends TransactionType {
    static decode(rlpEncoded) {
        const decoded = _decode(rlpEncoded)
        decoded.account = Account.fromRLPEncodedKey(decoded.from, decoded.rlpEncodedKey)
        return new AccountUpdate(decoded)
    }

    constructor(createTxObj) {
        if (_.isString(createTxObj)) createTxObj = _decode(createTxObj)
        super(TX_TYPE_ENUM.ACCOUNT_UPDATE, TX_TYPE_ENUM.ACCOUNT_UPDATE_TYPE_TAG, createTxObj)
        this.from = createTxObj.from
        this.account = createTxObj.account
        if (this.from.toLowerCase() !== this.account.address.toLowerCase()) throw new Error(`Inconsistency`)
    }

    getRLPEncoding() {
        return (
            TX_TYPE_ENUM.ACCOUNT_UPDATE_TYPE_TAG +
            RLP.encode([
                Bytes.fromNat(this.nonce),
                Bytes.fromNat(this.gasPrice),
                Bytes.fromNat(this.gas),
                this.from.toLowerCase(),
                this.account.getRLPEncodedKey(),
                this.signatures,
            ]).slice(2)
        )
    }

    _getCommonRLPEncodingForSigning() {
        return RLP.encode([
            TX_TYPE_ENUM.ACCOUNT_UPDATE_TYPE_TAG,
            Bytes.fromNat(this.nonce),
            Bytes.fromNat(this.gasPrice),
            Bytes.fromNat(this.gas),
            this.from.toLowerCase(),
            this.account.getRLPEncodedKey(),
        ])
    }
}

module.exports = AccountUpdate
