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
const Contract = require('../caver-klay-contract/src')
const { KCT_TYPE, validateTokenInfoForDeploy, kip8JsonInterface, kip8ByteCode, determineSendParams } = require('./kctHelper')
const { toBuffer, isHexStrict, toHex } = require('../../caver-utils/src')
const { isAddress } = require('../../caver-utils/src')

class KIP8 extends Contract {
    static deploy(tokenInfo, deployer) {
        validateTokenInfoForDeploy(tokenInfo, KCT_TYPE.NONFUNGIBLE)

        const { name, symbol } = tokenInfo
        const kip8 = new KIP8()

        return kip8
            .deploy({
                data: kip8ByteCode,
                arguments: [name, symbol],
            })
            .send({ from: deployer, gas: 6600000, value: 0 })
    }

    constructor(tokenAddress, abi = kip8JsonInterface) {
        if (tokenAddress) {
            if (_.isString(tokenAddress)) {
                if (!isAddress(tokenAddress)) throw new Error(`Invalid token address ${tokenAddress}`)
            } else {
                abi = tokenAddress
                tokenAddress = undefined
            }
        }
        super(abi, tokenAddress)
    }

    clone(tokenAddress = this.options.address) {
        return new this.constructor(tokenAddress, this.options.jsonInterface)
    }

    supportsInterface(interfaceId) {
        return this.methods.supportsInterface(interfaceId).call()
    }

    name() {
        return this.methods.name().call()
    }

    symbol() {
        return this.methods.symbol().call()
    }

    tokenURI(tokenId) {
        return this.methods.tokenURI(tokenId).call()
    }

    totalSupply() {
        return this.methods.totalSupply().call()
    }

    tokenOfOwnerByIndex(owner, index) {
        return this.methods.tokenOfOwnerByIndex(owner, index).call()
    }

    tokenByIndex(index) {
        return this.methods.tokenByIndex(index).call()
    }

    balanceOf(account) {
        return this.methods.balanceOf(account).call()
    }

    ownerOf(tokenId) {
        return this.methods.ownerOf(tokenId).call()
    }

    getApproved(tokenId) {
        return this.methods.getApproved(tokenId).call()
    }

    isApprovedForAll(owner, operator) {
        return this.methods.isApprovedForAll(owner, operator).call()
    }

    isMinter(account) {
        return this.methods.isMinter(account).call()
    }

    paused() {
        return this.methods.paused().call()
    }

    isPauser(account) {
        return this.methods.isPauser(account).call()
    }

    async approve(to, tokenId, sendParam = {}) {
        const executableObj = this.methods.approve(to, tokenId)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    async setApprovalForAll(to, approved, sendParam = {}) {
        const executableObj = this.methods.setApprovalForAll(to, approved)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    async transferFrom(from, to, tokenId, sendParam = {}) {
        const executableObj = this.methods.transferFrom(from, to, tokenId)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    async safeTransferFrom(from, to, tokenId, data, sendParam = {}) {
        if (data && _.isObject(data)) {
            if (data.gas !== undefined || data.from !== undefined) {
                if (Object.keys(sendParam).length > 0) throw new Error(`Invalid parameters`)
                sendParam = data
                data = undefined
            }
        }

        if (data && !_.isBuffer(data)) {
            if (_.isString(data) && !isHexStrict(data)) data = toHex(data)
            data = toBuffer(data)
        }

        const executableObj = data
            ? this.methods.safeTransferFrom(from, to, tokenId, data)
            : this.methods.safeTransferFrom(from, to, tokenId)

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

    async mintWithTokenURI(to, tokenId, tokenURI, sendParam = {}) {
        const executableObj = this.methods.mintWithTokenURI(to, tokenId, tokenURI)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    async burn(tokenId, sendParam = {}) {
        const executableObj = this.methods.burn(tokenId)
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

    async addPauser(account, sendParam = {}) {
        const executableObj = this.methods.addPauser(account)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    async renouncePauser(sendParam = {}) {
        const executableObj = this.methods.renouncePauser()
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }
}

module.exports = KIP8
