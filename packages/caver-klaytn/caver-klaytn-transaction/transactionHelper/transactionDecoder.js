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

const { TX_TYPE_ENUM, typeDetectionFromRLPEncoding } = require('./transacitonHelper')
const Legacy = require('../legacyTransaction/legacyTransaction')
const ValueTransfer = require('../valueTransfer/valueTransfer')
const FeeDelegatedValueTransfer = require('../valueTransfer/feeDelegatedValueTransfer')
const FeeDelegatedValueTransferWithRatio = require('../valueTransfer/feeDelegatedValueTransferWithRatio')

class TransactionDecoder {
    static decode(rlpEncoded) {
        const type = typeDetectionFromRLPEncoding(rlpEncoded)

        switch (type) {
            case TX_TYPE_ENUM.LEGACY:
                return Legacy.decode(rlpEncoded)
            case TX_TYPE_ENUM.VALUE_TRANSFER:
                return ValueTransfer.decode(rlpEncoded)
            case TX_TYPE_ENUM.FEE_DELEGATED_VALUE_TRANSFER:
                return FeeDelegatedValueTransfer.decode(rlpEncoded)
            case TX_TYPE_ENUM.FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO:
                return FeeDelegatedValueTransferWithRatio.decode(rlpEncoded)
        }
    }
}

module.exports = TransactionDecoder
