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

class ERC20Pausable extends ERC20 {
    static deploy(tokenInfo, deployer) {
        const erc20Pausable = new ERC20Pausable()
        return erc20Pausable.deploy(tokenInfo, deployer)
    }

    constructor(tokenAddress) {
        super(ERC20_TYPES.ERC20Pausable, tokenAddress)
    }

    clone(tokenAddress) {
        return new this.constructor(tokenAddress)
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

module.exports = ERC20Pausable
