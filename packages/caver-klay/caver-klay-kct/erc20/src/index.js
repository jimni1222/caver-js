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
const Contract = require('../../../caver-klay-contract')
const { ERC20_TYPES, ERC20_ABI_CODE } = require('./erc20Helper')
const { isAddress } = require('../../../../caver-utils')

class ERC20 extends Contract {
    // Parameters of ERC20 constructor
    // 1. without parameters (default ERC20_TYPES.ERC20 type)
    // 2. with token type (ERC20 extensions are passing specific type)
    // 3. with contract address (already deployed token contract)
    // 4. with token type and contract address (already deployed erc20 extension token contract)
    constructor(tokenType = ERC20_TYPES.ERC20, tokenAddress) {
        if (!tokenAddress && isAddress(tokenType)) {
            tokenAddress = tokenType
            tokenType = ERC20_TYPES.ERC20
        }

        super(ERC20_ABI_CODE[tokenType].abi, tokenAddress)

        let type = tokenType
        Object.defineProperty(this, 'type', {
            get() {
                return type
            },
            set(t) {
                this.options.jsonInterface = ERC20_ABI_CODE[t].abi
                type = t
            },
            enumerable: true,
        })
    }

    clone(tokenAddress) {
        return new this.constructor(tokenAddress)
    }

    deploy(tokenInfo, deployer, cap) {
        if (this.options.address) throw new Error(`The token contract is already deployed at ${this.options.address}.`)

        validateParamObjForDeploy(tokenInfo)

        const { name, symbol, decimal, initialSupply } = tokenInfo
        const args = cap ? [cap, name, symbol, decimal, initialSupply] : [name, symbol, decimal, initialSupply]
        const gas = 2500000
        const value = 0

        return super
            .deploy({
                data: ERC20_ABI_CODE[this.type].code,
                arguments: args,
            })
            .send({ from: deployer, gas, value })
    }

    // Below methods for ERC20
    name() {
        return this.methods.name().call()
    }

    symbol() {
        return this.methods.symbol().call()
    }

    decimals() {
        return this.methods.decimals().call()
    }

    totalSupply() {
        return this.methods.totalSupply().call()
    }

    balanceOf(account) {
        return this.methods.balanceOf(account).call()
    }

    allowance(owner, spender) {
        return this.methods.allowance(owner, spender).call()
    }

    approve(owner, spender, amount) {
        const gas = 60000
        return this.methods.approve(spender, amount).send({ from: owner, gas })
    }

    transfer(from, to, amount) {
        const gas = 60000
        return this.methods.transfer(to, amount).send({ from, gas })
    }

    transferFrom(msgSender, from, to, amount) {
        const gas = 70000
        return this.methods.transferFrom(from, to, amount).send({ from: msgSender, gas })
    }
}

function validateParamObjForDeploy(obj) {
    if (!obj.name || !_.isString(obj.name)) throw new Error(`Invalid name of token`)
    if (!obj.symbol || !_.isString(obj.symbol)) throw new Error(`Invalid symbol of token`)
    if (obj.decimal === undefined || !_.isNumber(obj.decimal)) throw new Error(`Invalid decimal of token`)
    if (obj.initialSupply === undefined || !_.isNumber(obj.initialSupply)) throw new Error(`Invalid initialSupply of token`)
}

module.exports = ERC20
