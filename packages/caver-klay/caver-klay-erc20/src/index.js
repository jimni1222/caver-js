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

const Contract = require('../../caver-klay-contract')
const {
    erc20JsonInterface,
    erc20ByteCode,
    erc20MintableJsonInterface,
    erc20MintableByteCode,
    erc20BurnableJsonInterface,
    erc20BurnableByteCode,
    erc20PausableJsonInterface,
    erc20PausableByteCode,
    erc20CappedJsonInterface,
    erc20CappedByteCode,
} = require('./erc20-helper')

class ERC20 extends Contract {
    constructor(tokenInfo = {}) {
        const { tokenAddress, jsonInterface = erc20JsonInterface } = tokenInfo
        super(jsonInterface, tokenAddress)
    }

    clone(tokenAddress) {
        return new this.constructor({ tokenAddress, jsonInterface: this.options.jsonInterface })
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

    // Below methods are for ERC20Mintable (extends)
    mint(account, amount) {
        const gas = 45000
        return this.methods.mint(account, amount).send({ from: account, gas })
    }

    isMinter(account) {
        return this.methods.isMinter(account).call()
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
    pause(msgSender) {
        const gas = 45000
        return this.methods.pause().send({ from: msgSender, gas })
    }

    unpause(msgSender) {
        const gas = 30000
        return this.methods.unpause().send({ from: msgSender, gas })
    }

    isPauser(account) {
        return this.methods.isPauser(account).call()
    }

    addPauser(msgSender, account) {
        const gas = 50000
        return this.methods.addPauser(account).send({ from: msgSender, gas })
    }

    renouncePauser(minterToRemove) {
        // TODO: gas check !!! gasUsed is 14000???
        const gas = 30000
        return this.methods.renouncePauser().send({ from: minterToRemove, gas })
    }

    // Below methods are for ERC20Capped (extends)
    cap() {
        return this.methods.cap().call()
    }

    // Deploy ERC20
    deploy(tokenInfo, deployer) {
        const { name, symbol, decimal, initialSupply } = tokenInfo
        const gas = 1500000
        const value = 0

        return super
            .deploy({
                data: erc20ByteCode,
                arguments: [name, symbol, decimal, initialSupply],
            })
            .send({ from: deployer, gas, value })
    }

    // Deploy ERC20Mintable
    deployMintable(tokenInfo, deployer) {
        this.options.jsonInterface = erc20MintableJsonInterface
        const { name, symbol, decimal, initialSupply } = tokenInfo
        const gas = 2500000
        const value = 0

        return super
            .deploy({
                data: erc20MintableByteCode,
                arguments: [name, symbol, decimal, initialSupply],
            })
            .send({ from: deployer, gas, value })
    }

    // Deploy ERC20Burnable
    deployBurnable(tokenInfo, deployer) {
        this.options.jsonInterface = erc20BurnableJsonInterface
        const { name, symbol, decimal, initialSupply } = tokenInfo
        const gas = 2500000
        const value = 0

        return super
            .deploy({
                data: erc20BurnableByteCode,
                arguments: [name, symbol, decimal, initialSupply],
            })
            .send({ from: deployer, gas, value })
    }

    // Deploy ERC20Pausable
    deployPausable(tokenInfo, deployer) {
        this.options.jsonInterface = erc20PausableJsonInterface
        const { name, symbol, decimal, initialSupply } = tokenInfo
        const gas = 2500000
        const value = 0

        return super
            .deploy({
                data: erc20PausableByteCode,
                arguments: [name, symbol, decimal, initialSupply],
            })
            .send({ from: deployer, gas, value })
    }

    // Deploy ERC20Pausable
    deployCapped(tokenInfo, deployer, cap) {
        this.options.jsonInterface = erc20CappedJsonInterface
        const { name, symbol, decimal, initialSupply } = tokenInfo
        const gas = 2500000
        const value = 0

        return super
            .deploy({
                data: erc20CappedByteCode,
                arguments: [cap, name, symbol, decimal, initialSupply],
            })
            .send({ from: deployer, gas, value })
    }
}

module.exports = ERC20
