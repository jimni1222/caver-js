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

class ERC20Capped extends ERC20 {
    static deploy(tokenInfo, deployer, cap) {
		const erc20Capped = new ERC20Capped()
        return erc20Capped.deploy(tokenInfo, deployer, cap)
    }

    constructor(tokenAddress) {
        super(ERC20_TYPES.ERC20Capped, tokenAddress)
    }

    clone(tokenAddress) {
        return new this.constructor(tokenAddress)
    }

    // Below methods are for ERC20Capped (extends)
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

    cap() {
        return this.methods.cap().call()
    }
}

module.exports = ERC20Capped
