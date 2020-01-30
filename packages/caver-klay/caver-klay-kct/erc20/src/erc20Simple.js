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

const Contract = require('../../../caver-klay-contract')
const { ERC20_TYPES, ERC20_ABI_CODE } = require('../../kctHelper')

class ERC20Simple extends Contract {
    constructor(tokenAddress, abi = ERC20_ABI_CODE[ERC20_TYPES.SIMPLE].abi) {
        super(abi, tokenAddress)
    }

    clone(tokenAddress) {
        return new this.constructor(tokenAddress)
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
}

module.exports = ERC20Simple
