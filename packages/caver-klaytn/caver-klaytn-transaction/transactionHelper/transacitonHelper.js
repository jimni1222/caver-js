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

const utils = require('../../../caver-utils')

const TX_TYPE_ENUM = {
    LEGACY: 'LEGACY',
    LEGACY_TYPE_TAG: '',
    '': 'LEGACY',

    VALUE_TRANSFER: 'VALUE_TRANSFER',
    VALUE_TRANSFER_TYPE_TAG: '0x08',
    '0x08': 'VALUE_TRANSFER',
    FEE_DELEGATED_VALUE_TRANSFER: 'FEE_DELEGATED_VALUE_TRANSFER',
    FEE_DELEGATED_VALUE_TRANSFER_TYPE_TAG: '0x09',
    '0x09': 'FEE_DELEGATED_VALUE_TRANSFER',
    FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO: 'FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO',
    FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO_TYPE_TAG: '0x0a',
    '0x0a': 'FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO',

    VALUE_TRANSFER_MEMO: '0x10',
    '0x10': 'VALUE_TRANSFER_MEMO',
    FEE_DELEGATED_VALUE_TRANSFER_MEMO: '0x11',
    '0x11': 'FEE_DELEGATED_VALUE_TRANSFER_MEMO',
    FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO: '0x12',
    '0x12': 'FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO',

    ACCOUNT_UPDATE: 'ACCOUNT_UPDATE',
    ACCOUNT_UPDATE_TYPE_TAG: '0x20',
    '0x20': 'ACCOUNT_UPDATE',
    FEE_DELEGATED_ACCOUNT_UPDATE: 'FEE_DELEGATED_ACCOUNT_UPDATE',
    FEE_DELEGATED_ACCOUNT_UPDATE_TYPE_TAG: '0x21',
    '0x21': 'FEE_DELEGATED_ACCOUNT_UPDATE',
    FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO: 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO',
    FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO_TYPE_TAG: '0x22',
    '0x22': 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO',

    SMART_CONTRACT_DEPLOY: '0x28',
    '0x28': 'SMART_CONTRACT_DEPLOY',
    FEE_DELEGATED_SMART_CONTRACT_DEPLOY: '0x29',
    '0x29': 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY',
    FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO: '0x2a',
    '0x2a': 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO',

    SMART_CONTRACT_EXECUTION: '0x30',
    '0x30': 'SMART_CONTRACT_EXECUTION',
    FEE_DELEGATED_SMART_CONTRACT_EXECUTION: '0x31',
    '0x31': 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
    FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO: '0x32',
    '0x32': 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO',

    CANCEL: '0x38',
    '0x38': 'CANCEL',
    FEE_DELEGATED_CANCEL: '0x39',
    '0x39': 'FEE_DELEGATED_CANCEL',
    FEE_DELEGATED_CANCEL_WITH_RATIO: '0x3a',
    '0x3a': 'FEE_DELEGATED_CANCEL_WITH_RATIO',
}

const TX_TYPE_TAG = {
    LEGACY_TYPE: '',
    '': TX_TYPE_ENUM.LEGACY,
    VALUE_TRANSFER: '0x08',
    '0x08': TX_TYPE_ENUM.VALUE_TRANSFER,
    FEE_DELEGATED_VALUE_TRANSFER: '0x09',
    '0x09': TX_TYPE_ENUM.FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO,
}

const refineSignatures = sigArray => {
    const set = new Set()
    let result = []
    for (const sig of sigArray) {
        if (sig.length > 0 && !utils.isEmptySig(sig)) {
            const sigString = sig.join('')
            if (!set.has(sigString)) {
                set.add(sigString, true)
                result.push(sig)
            }
        }
    }

    if (result.length === 0) result = [['0x01', '0x', '0x']]

    return result
}

const typeDetectionFromRLPEncoding = rlpEncoded => {
    const typeTag = utils.addHexPrefix(rlpEncoded).slice(0, 4)
    return TX_TYPE_ENUM[typeTag] ? TX_TYPE_ENUM[typeTag] : TX_TYPE_ENUM.LEGACY
}

module.exports = {
    TX_TYPE_ENUM,
    TX_TYPE_TAG,
    refineSignatures,
    typeDetectionFromRLPEncoding,
}
