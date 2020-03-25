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

const RLP = require('eth-lib/lib/rlp')
const Bytes = require('eth-lib/lib/bytes')
const _ = require('lodash')
const FeeDelegatedTransactionType = require('../feeDelegatedTransactionType')
const { TX_TYPE_ENUM, refineSignatures } = require('../transactionHelper/transacitonHelper')
const FeeDelegatedValueTransfer = require('./feeDelegatedValueTransfer')

function _decode(rlpEncoded) {
    const typeDettached = `0x${rlpEncoded.slice(4)}`
    const [nonce, gasPrice, gas, to, value, from, feeRatio, signatures, feePayer, feePayerSignatures] = RLP.decode(typeDettached)
    return {
        nonce,
        gasPrice,
        gas,
        to,
        value,
        from,
        feeRatio,
        signatures,
        feePayer,
        feePayerSignatures,
    }
}
class FeeDelegatedValueTransferWithRatio extends FeeDelegatedValueTransfer {
    static decode(rlpEncoded) {
        return new FeeDelegatedTransactionType(_decode(rlpEncoded))
    }

    constructor(createTxObj) {
        if (_.isString(createTxObj)) createTxObj = _decode(createTxObj)
        super(createTxObj, TX_TYPE_ENUM.FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO)
        this.feeRatio = createTxObj.feeRatio
    }

    getRLPEncoding() {
        const feePayer = this.feePayer || '0x'
        const signatures = refineSignatures(this.signatures)
        const feePayerSignatures = refineSignatures(this.feePayerSignatures)
        return (
            TX_TYPE_ENUM.FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO_TYPE_TAG +
            RLP.encode([
                Bytes.fromNat(this.nonce),
                Bytes.fromNat(this.gasPrice),
                Bytes.fromNat(this.gas),
                this.to.toLowerCase(),
                Bytes.fromNat(this.value),
                this.from.toLowerCase(),
                this.feeRatio,
                signatures,
                feePayer.toLowerCase(),
                feePayerSignatures,
            ]).slice(2)
        )
    }

    _getCommonRLPEncodingForSigning() {
        return RLP.encode([
            TX_TYPE_ENUM.FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO_TYPE_TAG,
            Bytes.fromNat(this.nonce),
            Bytes.fromNat(this.gasPrice),
            Bytes.fromNat(this.gas),
            this.to.toLowerCase(),
            Bytes.fromNat(this.value),
            this.from.toLowerCase(),
            this.feeRatio,
        ])
    }
}

module.exports = FeeDelegatedValueTransferWithRatio
