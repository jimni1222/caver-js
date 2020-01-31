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
const { ERC20_TYPES, ERC20_ABI_CODE } = require('../kctHelper')
const { isAddress } = require('../../../caver-utils/src')
const formatters = require('../../../caver-core-helpers/src/formatters')
const Method = require('../../../caver-core-method/src')
const ERC20Simple = require('./erc20Simple')
const ERC20Full = require('./erc20Full')
const core = require('../../../caver-core/src')

const CODE_HASH = {
    SIMPLE: 'CDq9tSXfwfXczNr64+lGjyJIk+3Soj161pUdTiwEiZw=',
    FULL: 'y8vE5WP/XH2zjic/RoBXTuD0B/MfDil6aNyHXeYbqLc=',
}

function deploySimple(tokenInfo, deployer) {
    _validateParamObjForDeploy(tokenInfo)

    const { name, symbol, decimals, initialSupply } = tokenInfo
    const erc20 = new ERC20Simple()

    return erc20
        .deploy({
            data: ERC20_ABI_CODE[ERC20_TYPES.SIMPLE].code,
            arguments: [name, symbol, decimals, initialSupply],
        })
        .send({ from: deployer, gas: 3500000, value: 0 })
}

function deploy(tokenInfo, deployer) {
    _validateParamObjForDeploy(tokenInfo)

    const { name, symbol, decimals, initialSupply } = tokenInfo

    const erc20 = new ERC20Full()
    return erc20
        .deploy({
            data: ERC20_ABI_CODE[ERC20_TYPES.FULL].code,
            arguments: [name, symbol, decimals, initialSupply],
        })
        .send({ from: deployer, gas: 3500000, value: 0 })
}

async function create(tokenAddress) {
    if (!isAddress(tokenAddress)) throw new Error(`Invalid token contract address (${tokenAddress}).`)

    const getAccount = new Method({
        name: 'getAccount',
        call: 'klay_getAccount',
        params: 2,
        inputFormatter: [formatters.inputLogFormatter, formatters.inputDefaultBlockNumberFormatter],
        requestManager: this._requestManager,
    }).createFunction()

    const result = await getAccount(tokenAddress)
    if (result.accType !== 2) {
        throw new Error(`Invalid token contract (${tokenAddress}). The account type should be 2 but got ${result.accType}`)
    }
    if (result.account.codeHash === CODE_HASH.SIMPLE) {
        return new ERC20Simple(tokenAddress)
    }
    if (result.account.codeHash !== CODE_HASH.FULL) {
        console.warn(`This token contract is not deployed through caver.klay.ERC20 so it may not work properly.`)
    }

    return new ERC20Full(tokenAddress)
}

function setProvider(provider, accounts) {
    core.packageInit(this, [provider])

    this._klayAccounts = accounts
}

function _validateParamObjForDeploy(obj) {
    if (!obj.name || !_.isString(obj.name)) throw new Error(`Invalid name of token`)
    if (!obj.symbol || !_.isString(obj.symbol)) throw new Error(`Invalid symbol of token`)
    if (obj.decimals === undefined || !_.isNumber(obj.decimals)) throw new Error(`Invalid decimals of token`)
    if (obj.initialSupply === undefined || !_.isNumber(obj.initialSupply)) throw new Error(`Invalid initialSupply of token`)
}

module.exports = {
    ERC20: {
        deploySimple,
        deploy,
        create,
        setProvider,
        CODE_HASH,
    },
}
