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
const { ERC20_TYPES, ERC20_ABI_CODE } = require('../../kctHelper')
const { isAddress } = require('../../../../caver-utils')

class ERC20 extends Contract {
    // TODO: Set default type, and change name of function
    static deploySimple(tokenInfo, deployer) {
        const erc20 = new ERC20()
        return erc20.deploy(tokenInfo, deployer, ERC20_TYPES.MINIMUM)
    }

    static deployFull(tokenInfo, deployer) {
        const erc20 = new ERC20()
        return erc20.deploy(tokenInfo, deployer, ERC20_TYPES.FULL)
    }

    constructor(tokenAddress) {
        if (tokenAddress && !isAddress(tokenAddress)) {
            throw new Error(`Invalid token contract address: The address of token contract is ${tokenAddress}.`)
        }
        super(ERC20_ABI_CODE[ERC20_TYPES.FULL].abi, tokenAddress)
    }

    clone(tokenAddress) {
        return new this.constructor(tokenAddress)
    }

    deploy(tokenInfo, deployer, type) {
        if (this.options.address) throw new Error(`The token contract is already deployed at ${this.options.address}.`)

        validateParamObjForDeploy(tokenInfo)

        const { name, symbol, decimal, initialSupply } = tokenInfo
        const gas = 3500000
        const value = 0

        return super
            .deploy({
                data: ERC20_ABI_CODE[type].code,
                arguments: [name, symbol, decimal, initialSupply],
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

    approve(msgSender, spender, amount) {
        const gas = 60000
        return this.methods.approve(spender, amount).send({ from: msgSender, gas })
    }

    transfer(msgSender, to, amount) {
        const gas = 60000
        return this.methods.transfer(to, amount).send({ from: msgSender, gas })
    }

    transferFrom(msgSender, from, to, amount) {
        const gas = 70000
        return this.methods.transferFrom(from, to, amount).send({ from: msgSender, gas })
    }

    // Below methods are for ERC20Mintable (extends)
    isMinter(account) {
        return this.methods.isMinter(account).call()
    }

    mint(msgSender, account, amount) {
        const gas = 45000
        return this.methods.mint(account, amount).send({ from: msgSender, gas })
    }

    addMinter(msgSender, account) {
        const gas = 50000
        return this.methods.addMinter(account).send({ from: msgSender, gas })
    }

    renounceMinter(minterToRemove) {
        // TODO: gas check !!! gasUsed is 14000???
        const gas = 30000
        return this.methods.renounceMinter().send({ from: minterToRemove, gas })
    }

    // Below methods are for ERC20Burnable (extends)
    burn(msgSender, amount) {
        const gas = 70000
        return this.methods.burn(amount).send({ from: msgSender, gas })
    }

    burnFrom(msgSender, from, amount) {
        const gas = 70000
        return this.methods.burnFrom(from, amount).send({ from: msgSender, gas })
    }

    // Below methods are for ERC20Pausable (extends)
    isPauser(account) {
        return this.methods.isPauser(account).call()
    }

    addPauser(msgSender, account) {
        const gas = 50000
        return this.methods.addPauser(account).send({ from: msgSender, gas })
    }

    pause(msgSender) {
        const gas = 45000
        return this.methods.pause().send({ from: msgSender, gas })
    }

    unpause(msgSender) {
        const gas = 30000
        return this.methods.unpause().send({ from: msgSender, gas })
    }

    renouncePauser(pauserToRemove) {
        // TODO: gas check !!! gasUsed is 14000???
        const gas = 30000
        return this.methods.renouncePauser().send({ from: pauserToRemove, gas })
    }
}

function validateParamObjForDeploy(obj) {
    if (!obj.name || !_.isString(obj.name)) throw new Error(`Invalid name of token`)
    if (!obj.symbol || !_.isString(obj.symbol)) throw new Error(`Invalid symbol of token`)
    if (obj.decimal === undefined || !_.isNumber(obj.decimal)) throw new Error(`Invalid decimal of token`)
    if (obj.initialSupply === undefined || !_.isNumber(obj.initialSupply)) throw new Error(`Invalid initialSupply of token`)
}

module.exports = ERC20
