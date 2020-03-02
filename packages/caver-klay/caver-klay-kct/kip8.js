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
const BigNumber = require('bignumber.js')

const Contract = require('../caver-klay-contract/src')
const {
    KCT_TYPE,
    validateTokenInfoForDeploy,
    kip8JsonInterface,
    kip8ByteCode,
    determineSendParams,
    formatParamForUint256,
} = require('./kctHelper')
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

    async supportsInterface(interfaceId) {
        const isSupported = await this.methods.supportsInterface(interfaceId).call()
        return isSupported
    }

    async name() {
        const name = await this.methods.name().call()
        return name
    }

    async symbol() {
        const symbol = await this.methods.symbol().call()
        return symbol
    }

    async tokenURI(tokenId) {
        const tokenURI = await this.methods.tokenURI(formatParamForUint256(tokenId)).call()
        return tokenURI
    }

    async totalSupply() {
        const totalSupply = await this.methods.totalSupply().call()
        return new BigNumber(totalSupply)
    }

    async tokenOfOwnerByIndex(owner, index) {
        const token = await this.methods.tokenOfOwnerByIndex(owner, formatParamForUint256(index)).call()
        return new BigNumber(token)
    }

    async tokenByIndex(index) {
        const token = await this.methods.tokenByIndex(formatParamForUint256(index)).call()
        return new BigNumber(token)
    }

    async balanceOf(account) {
        const balance = await this.methods.balanceOf(account).call()
        return new BigNumber(balance)
    }

    async ownerOf(tokenId) {
        const owner = await this.methods.ownerOf(formatParamForUint256(tokenId)).call()
        return owner
    }

    async getApproved(tokenId) {
        const isApproved = await this.methods.getApproved(formatParamForUint256(tokenId)).call()
        return isApproved
    }

    async isApprovedForAll(owner, operator) {
        const isApprovedForAll = await this.methods.isApprovedForAll(owner, operator).call()
        return isApprovedForAll
    }

    async isMinter(account) {
        const isMinter = await this.methods.isMinter(account).call()
        return isMinter
    }

    async paused() {
        const isPaused = await this.methods.paused().call()
        return isPaused
    }

    async isPauser(account) {
        const isPauser = await this.methods.isPauser(account).call()
        return isPauser
    }

    async approve(to, tokenId, sendParam = {}) {
        const executableObj = this.methods.approve(to, formatParamForUint256(tokenId))
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    async setApprovalForAll(to, approved, sendParam = {}) {
        const executableObj = this.methods.setApprovalForAll(to, approved)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    async transferFrom(from, to, tokenId, sendParam = {}) {
        const executableObj = this.methods.transferFrom(from, to, formatParamForUint256(tokenId))
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
            ? this.methods.safeTransferFrom(from, to, formatParamForUint256(tokenId), data)
            : this.methods.safeTransferFrom(from, to, formatParamForUint256(tokenId))

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
        const executableObj = this.methods.mintWithTokenURI(to, formatParamForUint256(tokenId), tokenURI)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    async burn(tokenId, sendParam = {}) {
        const executableObj = this.methods.burn(formatParamForUint256(tokenId))
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
