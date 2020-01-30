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

const ERC20Simple = require('./erc20Simple')
const { ERC20_TYPES, ERC20_ABI_CODE } = require('../../kctHelper')

class ERC20Full extends ERC20Simple {
    constructor(tokenAddress) {
        super(tokenAddress, ERC20_ABI_CODE[ERC20_TYPES.FULL].abi)
    }

    clone(tokenAddress) {
        return new this.constructor(tokenAddress)
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
        const gas = 30000
        return this.methods.renouncePauser().send({ from: pauserToRemove, gas })
    }
}

module.exports = ERC20Full
