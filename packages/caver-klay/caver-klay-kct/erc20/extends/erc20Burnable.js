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

const ERC20 = require('../src/index')
const { ERC20_TYPES } = require('../src/erc20Helper')

class ERC20Burnable extends ERC20 {
    static deploy(tokenInfo, deployer) {
        const erc20Burnable = new ERC20Burnable()
        return erc20Burnable.deploy(tokenInfo, deployer)
    }

    constructor(tokenAddress) {
        super(ERC20_TYPES.ERC20Burnable, tokenAddress)
    }

    clone(tokenAddress) {
        return new this.constructor(tokenAddress)
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
}

module.exports = ERC20Burnable
