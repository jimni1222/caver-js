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
const { erc721JsonInterface, erc721ByteCode } = require('../kctHelper')
const { isAddress, toBuffer, isHexStrict, toHex } = require('../../../caver-utils')

class ERC721 extends Contract {
    static deploy(tokenInfo, deployer) {
        const erc721 = new ERC721()
        return erc721.deploy(tokenInfo, deployer)
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

    deploy(tokenInfo, deployer) {
        if (this.options.address) throw new Error(`The token contract is already deployed at ${this.options.address}.`)

        validateParamObjForDeploy(tokenInfo)

        const { name, symbol } = tokenInfo
        const gas = 6600000
        const value = 0

        return super
            .deploy({
                data: erc721ByteCode,
                arguments: [name, symbol],
            })
            .send({ from: deployer, gas, value })
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

    approve(msgSender, to, tokenId) {
        const gas = 60000
        return this.methods.approve(to, tokenId).send({ from: msgSender, gas })
    }

    getApproved(tokenId) {
        return this.methods.getApproved(tokenId).call()
    }

    setApprovalForAll(msgSender, to, approved) {
        const gas = 60000
        return this.methods.setApprovalForAll(to, approved).send({ from: msgSender, gas })
    }

    isApprovedForAll(owner, operator) {
        return this.methods.isApprovedForAll(owner, operator).call()
    }

    transferFrom(msgSender, from, to, tokenId) {
        const gas = 150000
        return this.methods.transferFrom(from, to, tokenId).send({ from: msgSender, gas })
    }

    safeTransferFrom(msgSender, from, to, tokenId, data) {
        const gas = 200000

        if (data && !_.isBuffer(data)) {
            if (_.isString(data) && !isHexStrict(data)) data = toHex(data)
            data = toBuffer(data)
        }

        const prepareRequest = data
            ? this.methods.safeTransferFrom(from, to, tokenId, data)
            : this.methods.safeTransferFrom(from, to, tokenId)
        return prepareRequest.send({ from: msgSender, gas })
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

    mintWithTokenURI(msgSender, to, tokenId, tokenURI) {
        const gas = 300000
        return this.methods.mintWithTokenURI(to, tokenId, tokenURI).send({ from: msgSender, gas })
    }

    burn(msgSender, tokenId) {
        const gas = 200000
        return this.methods.burn(tokenId).send({ from: msgSender, gas })
    }

    paused() {
        return this.methods.paused().call()
    }

    isPauser(account) {
        return this.methods.isPauser(account).call()
    }

    pause(msgSender) {
        const gas = 45000
        return this.methods.pause().send({ from: msgSender, gas })
    }

    unpause(msgSender) {
        const gas = 30000
        return this.methods.unpause().send({ from: msgSender, gas })
    }

    addPauser(msgSender, account) {
        const gas = 50000
        return this.methods.addPauser(account).send({ from: msgSender, gas })
    }

    renouncePauser(pauserToRemove) {
        // TODO: gas check !!! gasUsed is 14000???
        const gas = 30000
        return this.methods.renouncePauser().send({ from: pauserToRemove, gas })
    }
}

function validateParamObjForDeploy(obj) {
    if (!obj.name || !_.isString(obj.name)) throw new Error(`Invalid name of token`)
    if (!obj.symbol || !_.isString(obj.symbol)) throw new Error(`Invalid symbol of token`)
}

module.exports = ERC721
