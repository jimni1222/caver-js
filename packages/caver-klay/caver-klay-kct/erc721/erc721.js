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
const Contract = require('../../caver-klay-contract')
const { erc721JsonInterface, erc721ByteCode, determineSendParams } = require('../kctHelper')
const { isAddress, toBuffer, isHexStrict, toHex } = require('../../../caver-utils')

class ERC721 extends Contract {
    static deploy(tokenInfo, deployer) {
        _validateParamObjForDeploy(tokenInfo)

        const { name, symbol } = tokenInfo
        const erc721 = new ERC721()

        return erc721
            .deploy({
                data: erc721ByteCode,
                arguments: [name, symbol],
            })
            .send({ from: deployer, gas: 6600000, value: 0 })
    }

    static create(tokenAddress) {
        return new ERC721(tokenAddress)
    }

    constructor(tokenAddress) {
        if (tokenAddress && !isAddress(tokenAddress)) {
            throw new Error(`Invalid token contract address: The address of token contract is ${tokenAddress}.`)
        }
        super(erc721JsonInterface, tokenAddress)
    }

    clone(tokenAddress) {
        return new this.constructor(tokenAddress)
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
            if (Object.keys(sendParam).length > 0) throw new Error(`Invalid parameters`)
            sendParam = data
            data = undefined
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

function _validateParamObjForDeploy(obj) {
    if (!obj.name || !_.isString(obj.name)) throw new Error(`Invalid name of token`)
    if (!obj.symbol || !_.isString(obj.symbol)) throw new Error(`Invalid symbol of token`)
}

module.exports = ERC721
