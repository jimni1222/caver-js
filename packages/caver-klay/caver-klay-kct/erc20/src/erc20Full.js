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
const { determineSendParams, ERC20_TYPES, ERC20_ABI_CODE } = require('../../kctHelper')

class ERC20Full extends ERC20Simple {
    constructor(tokenAddress) {
        super(tokenAddress, ERC20_ABI_CODE[ERC20_TYPES.FULL].abi)
    }

    clone(tokenAddress) {
        return new this.constructor(tokenAddress)
    }

    isMinter(account) {
        return this.methods.isMinter(account).call()
    }

    isPauser(account) {
        return this.methods.isPauser(account).call()
    }

    async mint(account, amount, sendParam = {}) {
        const executableObj = this.methods.mint(account, amount)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    async addMinter(account, sendParam = {}) {
        const executableObj = this.methods.addMinter(account)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    async renounceMinter(sendParam = {}) {
        const executableObj = this.methods.renounceMinter()
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    async burn(amount, sendParam = {}) {
        const executableObj = this.methods.burn(amount)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    async burnFrom(from, amount, sendParam = {}) {
        const executableObj = this.methods.burnFrom(from, amount)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    async addPauser(account, sendParam = {}) {
        const executableObj = this.methods.addPauser(account)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    async pause(sendParam = {}) {
        const executableObj = this.methods.pause()
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    async unpause(sendParam = {}) {
        const executableObj = this.methods.unpause()
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    async renouncePauser(sendParam = {}) {
        const executableObj = this.methods.renouncePauser()
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }
}

module.exports = ERC20Full
