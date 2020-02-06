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

const testRPCURL = require('../testrpc')
const { expect } = require('../extendedChai')

const Caver = require('../../index.js')

let caver
let sender
let testAccount
let receiver

let nonFungibleTokenAddress

const tokenInfo = {
    name: 'Jasmine',
    symbol: 'JAS',
}

const tokenURI = 'https://game.example/item-id-8u5h2m.json'

const prepareTestSetting = () => {
    testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
    receiver = caver.klay.accounts.wallet.add(caver.klay.accounts.create())

    const txObject = {
        from: sender.address,
        to: testAccount.address,
        value: caver.utils.toPeb(1, 'KLAY'),
        gas: 900000,
    }

    return caver.klay.sendTransaction(txObject)
}

before(function(done) {
    this.timeout(200000)
    caver = new Caver(testRPCURL)

    const senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey

    caver.klay.accounts.wallet.add(senderPrvKey)

    sender = caver.klay.accounts.privateKeyToAccount(senderPrvKey)

    prepareTestSetting().then(() => done())
})

describe('caver.klay.ERC721', () => {
    context('caver.klay.ERC721.deploy', () => {
        it('should deploy non fungible token contract and return ERC721 instance', async () => {
            const deployed = await caver.klay.ERC721.deploy(tokenInfo, sender.address)

            expect(deployed.options.address).not.to.be.undefined

            const account = await caver.klay.getAccount(deployed.options.address)

            expect(account.accType).to.equals(2)
            expect(account.account.key.keyType).to.equals(3)

            nonFungibleTokenAddress = deployed.options.address
        }).timeout(200000)

        it('should throw error when token information is insufficient or invalid', async () => {
            let expectedError = 'Invalid name of token'
            let insufficientToken = {}
            let invalidToken = { name: 1 }
            expect(() => caver.klay.ERC721.deploy(insufficientToken, sender.address)).to.throws(expectedError)
            expect(() => caver.klay.ERC721.deploy(invalidToken, sender.address)).to.throws(expectedError)

            expectedError = 'Invalid symbol of token'
            insufficientToken = { name: 'Jasmine' }
            invalidToken = { name: 'Jasmine', symbol: 1 }
            expect(() => caver.klay.ERC721.deploy(insufficientToken, sender.address)).to.throws(expectedError)
            expect(() => caver.klay.ERC721.deploy(invalidToken, sender.address)).to.throws(expectedError)
        }).timeout(200000)
    })

    context('ERC721.clone', () => {
        it('should clone ERC721 instance with new token contract address', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const newTokenContract = caver.klay.accounts.create().address
            const cloned = token.clone(newTokenContract)

            expect(cloned.options.address).to.equals(newTokenContract)
            expect(cloned.options.address).not.to.equals(token.options.address)
        }).timeout(200000)
    })

    context('ERC721.name', () => {
        it('should call name method', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const name = await token.name()

            expect(name).to.equals(tokenInfo.name)
        }).timeout(200000)
    })

    context('ERC721.symbol', () => {
        it('should call symbol method', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const symbol = await token.symbol()

            expect(symbol).to.equals(tokenInfo.symbol)
        }).timeout(200000)
    })

    context('ERC721.totalSupply', () => {
        it('should call totalSupply method', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            let totalSupply = await token.totalSupply()
            expect(totalSupply).to.equals('0')

            await token.mintWithTokenURI(sender.address, totalSupply, tokenURI, { from: sender.address })

            totalSupply = await token.totalSupply()
            expect(totalSupply).to.equals('1')
        }).timeout(200000)
    })

    context('ERC721.tokenURI', () => {
        it('should call tokenURI method', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const uri = await token.tokenURI('0')
            expect(uri).to.equals(tokenURI)
        }).timeout(200000)
    })

    context('ERC721.tokenOfOwnerByIndex', () => {
        it('should call tokenOfOwnerByIndex method', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const tokenByIndex = await token.tokenOfOwnerByIndex(sender.address, 0)
            expect(tokenByIndex).to.equals('0')
        }).timeout(200000)
    })

    context('ERC721.tokenByIndex', () => {
        it('should call tokenByIndex method', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            let tokenByIndex = await token.tokenByIndex(0)
            expect(tokenByIndex).to.equals('0')

            await token.mintWithTokenURI(testAccount.address, '1', tokenURI, { from: sender.address })

            tokenByIndex = await token.tokenByIndex(1)
            expect(tokenByIndex).to.equals('1')
        }).timeout(200000)
    })

    context('ERC721.balanceOf', () => {
        it('should call balanceOf method', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            let balance = await token.balanceOf(sender.address)
            expect(balance).to.equals('1')

            balance = await token.balanceOf(caver.klay.accounts.create().address)
            expect(balance).to.equals('0')
        }).timeout(200000)
    })

    context('ERC721.ownerOf', () => {
        it('should call balanceOf method', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            let owner = await token.ownerOf('0')
            expect(owner.toLowerCase()).to.equals(sender.address.toLowerCase())

            owner = await token.ownerOf('1')
            expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())
        }).timeout(200000)
    })

    context('ERC721.getApproved', () => {
        it('should call getApproved method', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            let approved = await token.getApproved('0')
            expect(approved).to.equals('0x0000000000000000000000000000000000000000')

            await token.approve(testAccount.address, '0', { from: sender.address })

            approved = await token.getApproved('0')
            expect(approved.toLowerCase()).to.equals(testAccount.address.toLowerCase())
        }).timeout(200000)
    })

    context('ERC721.isApprovedForAll', () => {
        it('should call isApprovedForAll method', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            let isApprovedForAll = await token.isApprovedForAll(sender.address, testAccount.address)
            expect(isApprovedForAll).to.be.false

            await token.setApprovalForAll(testAccount.address, true, { from: sender.address })

            isApprovedForAll = await token.isApprovedForAll(sender.address, testAccount.address)
            expect(isApprovedForAll).to.be.true
        }).timeout(200000)
    })

    context('ERC721.isMinter', () => {
        it('should call isMinter method', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            let isMinter = await token.isMinter(sender.address)
            expect(isMinter).to.be.true

            isMinter = await token.isMinter(testAccount.address)
            expect(isMinter).to.be.false

            await token.addMinter(testAccount.address, { from: sender.address })

            isMinter = await token.isMinter(testAccount.address)
            expect(isMinter).to.be.true

            await token.renounceMinter({ from: testAccount.address })

            isMinter = await token.isMinter(testAccount.address)
            expect(isMinter).to.be.false
        }).timeout(200000)
    })

    context('ERC721.paused', () => {
        it('should call paused method', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            let paused = await token.paused()
            expect(paused).to.be.false

            await token.pause({ from: sender.address })

            paused = await token.paused()
            expect(paused).to.be.true

            await token.unpause({ from: sender.address })

            paused = await token.paused()
            expect(paused).to.be.false
        }).timeout(200000)
    })

    context('ERC721.isPauser', () => {
        it('should call isPauser method', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            let isPauser = await token.isPauser(sender.address)
            expect(isPauser).to.be.true

            isPauser = await token.isPauser(testAccount.address)
            expect(isPauser).to.be.false

            await token.addPauser(testAccount.address, { from: sender.address })

            isPauser = await token.isPauser(testAccount.address)
            expect(isPauser).to.be.true

            await token.renouncePauser({ from: testAccount.address })

            isPauser = await token.isPauser(testAccount.address)
            expect(isPauser).to.be.false
        }).timeout(200000)
    })

    context('ERC721.approve', () => {
        it('should send transaction for calling approve method and set approve with token id without sendParams', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const mintedTokenId = '2'
            await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })

            // set deafult from address in kip7 instance
            token.options.from = sender.address

            const approved = await token.approve(testAccount.address, mintedTokenId)
            expect(approved.from).to.be.equals(sender.address.toLowerCase())
            expect(approved.status).to.be.true
            expect(approved.events).not.to.be.undefined
            expect(approved.events.Approval).not.to.be.undefined
            expect(approved.events.Approval.address).to.equals(nonFungibleTokenAddress)

            const getApproved = await token.getApproved(mintedTokenId)

            expect(getApproved.toLowerCase()).to.equals(testAccount.address.toLowerCase())
        }).timeout(200000)

        it('should send transaction for calling approve method and set approve with token id with sendParams(from)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const mintedTokenId = '3'
            await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })

            const approved = await token.approve(testAccount.address, mintedTokenId, { from: sender.address })
            expect(approved.from).to.be.equals(sender.address.toLowerCase())
            expect(approved.status).to.be.true
            expect(approved.events).not.to.be.undefined
            expect(approved.events.Approval).not.to.be.undefined
            expect(approved.events.Approval.address).to.equals(nonFungibleTokenAddress)

            const getApproved = await token.getApproved(mintedTokenId)

            expect(getApproved.toLowerCase()).to.equals(testAccount.address.toLowerCase())
        }).timeout(200000)

        it('should send transaction for calling approve method and set approve with token id with sendParams(from, gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const mintedTokenId = '4'
            await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })

            const customGasLimit = '0x186a0'

            const approved = await token.approve(testAccount.address, mintedTokenId, { from: sender.address, gas: customGasLimit })
            expect(approved.gas).to.equals(customGasLimit)
            expect(approved.status).to.be.true
            expect(approved.events).not.to.be.undefined
            expect(approved.events.Approval).not.to.be.undefined
            expect(approved.events.Approval.address).to.equals(nonFungibleTokenAddress)

            const getApproved = await token.getApproved(mintedTokenId)

            expect(getApproved.toLowerCase()).to.equals(testAccount.address.toLowerCase())
        }).timeout(200000)

        it('should send transaction for calling approve method and set approve with token id with sendParams(gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const mintedTokenId = '5'
            await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })

            const customGasLimit = '0x186a0'

            // set deafult from address in kip7 instance
            token.options.from = sender.address

            const approved = await token.approve(testAccount.address, mintedTokenId, { gas: customGasLimit })
            expect(approved.from).to.be.equals(sender.address.toLowerCase())
            expect(approved.gas).to.equals(customGasLimit)
            expect(approved.status).to.be.true
            expect(approved.events).not.to.be.undefined
            expect(approved.events.Approval).not.to.be.undefined
            expect(approved.events.Approval.address).to.equals(nonFungibleTokenAddress)

            const getApproved = await token.getApproved(mintedTokenId)

            expect(getApproved.toLowerCase()).to.equals(testAccount.address.toLowerCase())
        }).timeout(200000)
    })

    context('ERC721.setApprovalForAll', () => {
        it('should send transaction for calling setApprovalForAll method and set approve with all token without sendParams', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            // set deafult from address in kip7 instance
            token.options.from = sender.address

            const setApprovalForAll = await token.setApprovalForAll(testAccount.address, false)
            expect(setApprovalForAll.from).to.be.equals(sender.address.toLowerCase())
            expect(setApprovalForAll.status).to.be.true
            expect(setApprovalForAll.events).not.to.be.undefined
            expect(setApprovalForAll.events.ApprovalForAll).not.to.be.undefined
            expect(setApprovalForAll.events.ApprovalForAll.address).to.equals(nonFungibleTokenAddress)

            const isApprovedForAll = await token.isApprovedForAll(sender.address, testAccount.address)

            expect(isApprovedForAll).to.be.false
        }).timeout(200000)

        it('should send transaction for calling approve method and set approve with all token with sendParams(from)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const setApprovalForAll = await token.setApprovalForAll(testAccount.address, true, { from: sender.address })
            expect(setApprovalForAll.from).to.be.equals(sender.address.toLowerCase())
            expect(setApprovalForAll.status).to.be.true
            expect(setApprovalForAll.events).not.to.be.undefined
            expect(setApprovalForAll.events.ApprovalForAll).not.to.be.undefined
            expect(setApprovalForAll.events.ApprovalForAll.address).to.equals(nonFungibleTokenAddress)

            const isApprovedForAll = await token.isApprovedForAll(sender.address, testAccount.address)

            expect(isApprovedForAll).to.be.true
        }).timeout(200000)

        it('should send transaction for calling approve method and set approve with all token with sendParams(from, gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const customGasLimit = '0x186a0'

            const setApprovalForAll = await token.setApprovalForAll(testAccount.address, false, {
                from: sender.address,
                gas: customGasLimit,
            })
            expect(setApprovalForAll.gas).to.equals(customGasLimit)
            expect(setApprovalForAll.status).to.be.true
            expect(setApprovalForAll.events).not.to.be.undefined
            expect(setApprovalForAll.events.ApprovalForAll).not.to.be.undefined
            expect(setApprovalForAll.events.ApprovalForAll.address).to.equals(nonFungibleTokenAddress)

            const isApprovedForAll = await token.isApprovedForAll(sender.address, testAccount.address)

            expect(isApprovedForAll).to.be.false
        }).timeout(200000)

        it('should send transaction for calling approve method and set approve with all token with sendParams(gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const customGasLimit = '0x186a0'

            // set deafult from address in kip7 instance
            token.options.from = sender.address

            const setApprovalForAll = await token.setApprovalForAll(testAccount.address, true, { gas: customGasLimit })
            expect(setApprovalForAll.from).to.be.equals(sender.address.toLowerCase())
            expect(setApprovalForAll.gas).to.equals(customGasLimit)
            expect(setApprovalForAll.status).to.be.true
            expect(setApprovalForAll.events).not.to.be.undefined
            expect(setApprovalForAll.events.ApprovalForAll).not.to.be.undefined
            expect(setApprovalForAll.events.ApprovalForAll.address).to.equals(nonFungibleTokenAddress)

            const isApprovedForAll = await token.isApprovedForAll(sender.address, testAccount.address)

            expect(isApprovedForAll).to.be.true
        }).timeout(200000)
    })

    context('ERC721.transferFrom', () => {
        it('should send transaction to transfer token and trigger Transfer event without sendParams', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            // set deafult from address in kip7 instance
            token.options.from = testAccount.address

            const tokenId = '2'
            const transfered = await token.transferFrom(sender.address, receiver.address, tokenId)
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

            const owner = await token.ownerOf(tokenId)
            expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(from)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            // set deafult from address in kip7 instance
            token.options.from = testAccount.address

            const tokenId = '3'
            const transfered = await token.transferFrom(sender.address, receiver.address, tokenId, { from: testAccount.address })
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

            const owner = await token.ownerOf(tokenId)
            expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(from, gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const customGasLimit = '0x249f0'

            const tokenId = '4'
            const transfered = await token.transferFrom(sender.address, receiver.address, tokenId, {
                from: testAccount.address,
                gas: customGasLimit,
            })
            expect(transfered.gas).to.equals(customGasLimit)
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

            const owner = await token.ownerOf(tokenId)
            expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            // set deafult from address in kip7 instance
            token.options.from = testAccount.address

            const customGasLimit = '0x249f0'

            const tokenId = '5'
            const transfered = await token.transferFrom(sender.address, receiver.address, tokenId, { gas: customGasLimit })
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.gas).to.equals(customGasLimit)
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

            const owner = await token.ownerOf(tokenId)
            expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
        }).timeout(200000)
    })

    context('ERC721.safeTransferFrom', () => {
        it('should send token via safeTransferFrom without data and trigger Transfer event without sendParams', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const tokenId = '6'
            await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })

            // set deafult from address in kip7 instance
            token.options.from = testAccount.address

            const transfered = await token.safeTransferFrom(sender.address, receiver.address, tokenId)
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

            const owner = await token.ownerOf(tokenId)
            expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
        }).timeout(200000)

        it('should send token via safeTransferFrom without data and trigger Transfer event with sendParams(from)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const tokenId = '7'
            await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })

            // set deafult from address in kip7 instance
            token.options.from = testAccount.address

            const transfered = await token.safeTransferFrom(sender.address, receiver.address, tokenId, { from: testAccount.address })
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

            const owner = await token.ownerOf(tokenId)
            expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
        }).timeout(200000)

        it('should send token via safeTransferFrom without data and trigger Transfer event with sendParams(from, gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const tokenId = '8'
            await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })

            const customGasLimit = '0x249f0'

            const transfered = await token.safeTransferFrom(sender.address, receiver.address, tokenId, {
                from: testAccount.address,
                gas: customGasLimit,
            })
            expect(transfered.gas).to.equals(customGasLimit)
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

            const owner = await token.ownerOf(tokenId)
            expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
        }).timeout(200000)

        it('should send token via safeTransferFrom without data and trigger Transfer event with sendParams(gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const tokenId = '9'
            await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })

            // set deafult from address in kip7 instance
            token.options.from = testAccount.address

            const customGasLimit = '0x249f0'

            const transfered = await token.safeTransferFrom(sender.address, receiver.address, tokenId, { gas: customGasLimit })
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.gas).to.equals(customGasLimit)
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

            const owner = await token.ownerOf(tokenId)
            expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
        }).timeout(200000)

        it('should send token via safeTransferFrom with data and trigger Transfer event without sendParams', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const tokenId = '10'
            await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })

            // set deafult from address in kip7 instance
            token.options.from = testAccount.address

            const transfered = await token.safeTransferFrom(sender.address, receiver.address, tokenId, Buffer.from('buffered data'))
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

            const owner = await token.ownerOf(tokenId)
            expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
        }).timeout(200000)

        it('should send token via safeTransferFrom with data and trigger Transfer event with sendParams(from)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const tokenId = '11'
            await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })

            // set deafult from address in kip7 instance
            token.options.from = testAccount.address

            const transfered = await token.safeTransferFrom(sender.address, receiver.address, tokenId, '0x1234', {
                from: testAccount.address,
            })
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

            const owner = await token.ownerOf(tokenId)
            expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
        }).timeout(200000)

        it('should send token via safeTransferFrom with data and trigger Transfer event with sendParams(from, gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const tokenId = '12'
            await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })

            const customGasLimit = '0x249f0'

            const transfered = await token.safeTransferFrom(sender.address, receiver.address, tokenId, 1234, {
                from: testAccount.address,
                gas: customGasLimit,
            })
            expect(transfered.gas).to.equals(customGasLimit)
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

            const owner = await token.ownerOf(tokenId)
            expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
        }).timeout(200000)

        it('should send token via safeTransferFrom with data and trigger Transfer event with sendParams(gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const tokenId = '13'
            await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })

            // set deafult from address in kip7 instance
            token.options.from = testAccount.address

            const customGasLimit = '0x249f0'

            const transfered = await token.safeTransferFrom(sender.address, receiver.address, tokenId, [1, 2, 3, 4], {
                gas: customGasLimit,
            })
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.gas).to.equals(customGasLimit)
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

            const owner = await token.ownerOf(tokenId)
            expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
        }).timeout(200000)
    })

    context('ERC721.addMinter', () => {
        it('should send transaction for adding minter and trigger MinterAdded event without sendParams', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const newMinter = caver.klay.accounts.create().address
            expect(await token.isMinter(newMinter)).to.be.false

            // set deafult from address in kip7 instance
            token.options.from = sender.address

            const minterAdded = await token.addMinter(newMinter)
            expect(minterAdded.from).to.be.equals(sender.address.toLowerCase())
            expect(minterAdded.status).to.be.true
            expect(minterAdded.events).not.to.be.undefined
            expect(minterAdded.events.MinterAdded).not.to.be.undefined
            expect(minterAdded.events.MinterAdded.address).to.equals(nonFungibleTokenAddress)

            expect(await token.isMinter(newMinter)).to.be.true
        }).timeout(200000)

        it('should send transaction for adding minter and trigger MinterAdded event with sendParams(from)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const newMinter = caver.klay.accounts.create().address
            expect(await token.isMinter(newMinter)).to.be.false

            const minterAdded = await token.addMinter(newMinter, { from: sender.address })
            expect(minterAdded.from).to.be.equals(sender.address.toLowerCase())
            expect(minterAdded.status).to.be.true
            expect(minterAdded.events).not.to.be.undefined
            expect(minterAdded.events.MinterAdded).not.to.be.undefined
            expect(minterAdded.events.MinterAdded.address).to.equals(nonFungibleTokenAddress)

            expect(await token.isMinter(newMinter)).to.be.true
        }).timeout(200000)

        it('should send transaction for adding minter and trigger MinterAdded event with sendParams(from, gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const newMinter = caver.klay.accounts.create().address
            expect(await token.isMinter(newMinter)).to.be.false

            const customGasLimit = '0x30d40'
            const minterAdded = await token.addMinter(newMinter, { from: sender.address, gas: customGasLimit })
            expect(minterAdded.gas).to.equals(customGasLimit)
            expect(minterAdded.from).to.be.equals(sender.address.toLowerCase())
            expect(minterAdded.status).to.be.true
            expect(minterAdded.events).not.to.be.undefined
            expect(minterAdded.events.MinterAdded).not.to.be.undefined
            expect(minterAdded.events.MinterAdded.address).to.equals(nonFungibleTokenAddress)

            expect(await token.isMinter(newMinter)).to.be.true
        }).timeout(200000)

        it('should send transaction for adding minter and trigger MinterAdded event with sendParams(gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const newMinter = caver.klay.accounts.create().address
            expect(await token.isMinter(newMinter)).to.be.false

            // set deafult from address in kip7 instance
            token.options.from = sender.address

            const customGasLimit = '0x30d40'
            const minterAdded = await token.addMinter(newMinter, { gas: customGasLimit })
            expect(minterAdded.from).to.be.equals(sender.address.toLowerCase())
            expect(minterAdded.status).to.be.true
            expect(minterAdded.events).not.to.be.undefined
            expect(minterAdded.events.MinterAdded).not.to.be.undefined
            expect(minterAdded.events.MinterAdded.address).to.equals(nonFungibleTokenAddress)

            expect(await token.isMinter(newMinter)).to.be.true
        }).timeout(200000)
    })

    context('ERC721.renounceMinter', () => {
        it('should send transaction for removing minter and trigger MinterRemoved event without sendParams', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            await token.addMinter(testAccount.address, { from: sender.address })
            expect(await token.isMinter(testAccount.address)).to.be.true

            // set deafult from address in kip7 instance
            token.options.from = testAccount.address

            const minterRemoved = await token.renounceMinter()
            expect(minterRemoved.from).to.be.equals(testAccount.address.toLowerCase())
            expect(minterRemoved.status).to.be.true
            expect(minterRemoved.events).not.to.be.undefined
            expect(minterRemoved.events.MinterRemoved).not.to.be.undefined
            expect(minterRemoved.events.MinterRemoved.address).to.equals(nonFungibleTokenAddress)

            expect(await token.isMinter(testAccount.address)).to.be.false
        }).timeout(200000)

        it('should send transaction for removing minter and trigger MinterRemoved event with sendParams(from)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            await token.addMinter(testAccount.address, { from: sender.address })
            expect(await token.isMinter(testAccount.address)).to.be.true

            const minterRemoved = await token.renounceMinter({ from: testAccount.address })
            expect(minterRemoved.from).to.be.equals(testAccount.address.toLowerCase())
            expect(minterRemoved.status).to.be.true
            expect(minterRemoved.events).not.to.be.undefined
            expect(minterRemoved.events.MinterRemoved).not.to.be.undefined
            expect(minterRemoved.events.MinterRemoved.address).to.equals(nonFungibleTokenAddress)

            expect(await token.isMinter(testAccount.address)).to.be.false
        }).timeout(200000)

        it('should send transaction for removing minter and trigger MinterRemoved event with sendParams(from, gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            await token.addMinter(testAccount.address, { from: sender.address })
            expect(await token.isMinter(testAccount.address)).to.be.true

            const customGasLimit = '0x30d40'
            const minterRemoved = await token.renounceMinter({ from: testAccount.address, gas: customGasLimit })
            expect(minterRemoved.gas).to.equals(customGasLimit)
            expect(minterRemoved.from).to.be.equals(testAccount.address.toLowerCase())
            expect(minterRemoved.status).to.be.true
            expect(minterRemoved.events).not.to.be.undefined
            expect(minterRemoved.events.MinterRemoved).not.to.be.undefined
            expect(minterRemoved.events.MinterRemoved.address).to.equals(nonFungibleTokenAddress)

            expect(await token.isMinter(testAccount.address)).to.be.false
        }).timeout(200000)

        it('should send transaction for removing minter and trigger MinterRemoved event with sendParams(gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            await token.addMinter(testAccount.address, { from: sender.address })
            expect(await token.isMinter(testAccount.address)).to.be.true

            // set deafult from address in kip7 instance
            token.options.from = testAccount.address

            const customGasLimit = '0x30d40'
            const minterRemoved = await token.renounceMinter({ gas: customGasLimit })
            expect(minterRemoved.from).to.be.equals(testAccount.address.toLowerCase())
            expect(minterRemoved.status).to.be.true
            expect(minterRemoved.events).not.to.be.undefined
            expect(minterRemoved.events.MinterRemoved).not.to.be.undefined
            expect(minterRemoved.events.MinterRemoved.address).to.equals(nonFungibleTokenAddress)

            expect(await token.isMinter(testAccount.address)).to.be.false
        }).timeout(200000)
    })

    context('ERC721.mintWithTokenURI', () => {
        it('should send transaction for minting and trigger Transfer event without sendParams', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const originalSupply = await token.totalSupply()

            // set deafult from address in kip7 instance
            token.options.from = sender.address

            const tokenId = '18'
            const minted = await token.mintWithTokenURI(testAccount.address, tokenId, tokenURI)
            expect(minted.from).to.be.equals(sender.address.toLowerCase())
            expect(minted.status).to.be.true
            expect(minted.events).not.to.be.undefined
            expect(minted.events.Transfer).not.to.be.undefined
            expect(minted.events.Transfer.address).to.equals(nonFungibleTokenAddress)

            const owner = await token.ownerOf(tokenId)
            expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())

            const afterSupply = await token.totalSupply()

            expect(Number(afterSupply) - Number(originalSupply)).to.equals(1)
        }).timeout(200000)

        it('should send transaction for minting and trigger Transfer event with sendParams(from)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const originalSupply = await token.totalSupply()

            const tokenId = '19'
            const minted = await token.mintWithTokenURI(testAccount.address, tokenId, tokenURI, { from: sender.address })
            expect(minted.from).to.be.equals(sender.address.toLowerCase())
            expect(minted.status).to.be.true
            expect(minted.events).not.to.be.undefined
            expect(minted.events.Transfer).not.to.be.undefined
            expect(minted.events.Transfer.address).to.equals(nonFungibleTokenAddress)

            const owner = await token.ownerOf(tokenId)
            expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())

            const afterSupply = await token.totalSupply()

            expect(Number(afterSupply) - Number(originalSupply)).to.equals(1)
        }).timeout(200000)

        it('should send transaction for minting and trigger Transfer event with sendParams(from, gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const originalSupply = await token.totalSupply()

            const customGasLimit = '0x493e0'
            const tokenId = '20'
            const minted = await token.mintWithTokenURI(testAccount.address, tokenId, tokenURI, {
                from: sender.address,
                gas: customGasLimit,
            })
            expect(minted.gas).to.equals(customGasLimit)
            expect(minted.from).to.be.equals(sender.address.toLowerCase())
            expect(minted.status).to.be.true
            expect(minted.events).not.to.be.undefined
            expect(minted.events.Transfer).not.to.be.undefined
            expect(minted.events.Transfer.address).to.equals(nonFungibleTokenAddress)

            const owner = await token.ownerOf(tokenId)
            expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())

            const afterSupply = await token.totalSupply()

            expect(Number(afterSupply) - Number(originalSupply)).to.equals(1)
        }).timeout(200000)

        it('should send transaction for minting and trigger Transfer event with sendParams(gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const originalSupply = await token.totalSupply()

            // set deafult from address in kip7 instance
            token.options.from = sender.address

            const customGasLimit = '0x493e0'
            const tokenId = '21'
            const minted = await token.mintWithTokenURI(testAccount.address, tokenId, tokenURI, { gas: customGasLimit })
            expect(minted.from).to.be.equals(sender.address.toLowerCase())
            expect(minted.status).to.be.true
            expect(minted.events).not.to.be.undefined
            expect(minted.events.Transfer).not.to.be.undefined
            expect(minted.events.Transfer.address).to.equals(nonFungibleTokenAddress)

            const owner = await token.ownerOf(tokenId)
            expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())

            const afterSupply = await token.totalSupply()

            expect(Number(afterSupply) - Number(originalSupply)).to.equals(1)
        }).timeout(200000)
    })

    context('ERC721.burn', () => {
        it('should send transaction for burning and trigger Transfer event without sendParams', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const tokenId = '14'
            await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })

            const originalSupply = await token.totalSupply()

            // set deafult from address in kip7 instance
            token.options.from = sender.address

            const burned = await token.burn(tokenId)
            expect(burned.from).to.be.equals(sender.address.toLowerCase())
            expect(burned.status).to.be.true
            expect(burned.events).not.to.be.undefined
            expect(burned.events.Transfer).not.to.be.undefined
            expect(burned.events.Transfer.address).to.equals(nonFungibleTokenAddress)

            const afterSupply = await token.totalSupply()
            expect(Number(originalSupply) - Number(afterSupply)).to.be.equals(1)
        }).timeout(200000)

        it('should send transaction for burning and trigger Transfer event with sendParams(from)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const tokenId = '15'
            await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })

            const originalSupply = await token.totalSupply()

            const burned = await token.burn(tokenId, { from: sender.address })
            expect(burned.from).to.be.equals(sender.address.toLowerCase())
            expect(burned.status).to.be.true
            expect(burned.events).not.to.be.undefined
            expect(burned.events.Transfer).not.to.be.undefined
            expect(burned.events.Transfer.address).to.equals(nonFungibleTokenAddress)

            const afterSupply = await token.totalSupply()
            expect(Number(originalSupply) - Number(afterSupply)).to.be.equals(1)
        }).timeout(200000)

        it('should send transaction for burning and trigger Transfer event with sendParams(from, gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const tokenId = '16'
            await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })

            const originalSupply = await token.totalSupply()

            const customGasLimit = '0x30d40'
            const burned = await token.burn(tokenId, { from: sender.address, gas: customGasLimit })
            expect(burned.gas).to.equals(customGasLimit)
            expect(burned.from).to.be.equals(sender.address.toLowerCase())
            expect(burned.status).to.be.true
            expect(burned.events).not.to.be.undefined
            expect(burned.events.Transfer).not.to.be.undefined
            expect(burned.events.Transfer.address).to.equals(nonFungibleTokenAddress)

            const afterSupply = await token.totalSupply()
            expect(Number(originalSupply) - Number(afterSupply)).to.be.equals(1)
        }).timeout(200000)

        it('should send transaction for burning and trigger Transfer event with sendParams(gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const tokenId = '17'
            await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })

            const originalSupply = await token.totalSupply()

            // set deafult from address in kip7 instance
            token.options.from = sender.address

            const customGasLimit = '0x30d40'
            const burned = await token.burn(tokenId, { gas: customGasLimit })
            expect(burned.from).to.be.equals(sender.address.toLowerCase())
            expect(burned.status).to.be.true
            expect(burned.events).not.to.be.undefined
            expect(burned.events.Transfer).not.to.be.undefined
            expect(burned.events.Transfer.address).to.equals(nonFungibleTokenAddress)

            const afterSupply = await token.totalSupply()
            expect(Number(originalSupply) - Number(afterSupply)).to.be.equals(1)
        }).timeout(200000)
    })

    context('ERC721.pause', () => {
        it('should send transaction for pausing without sendParams', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            // set deafult from address in kip7 instance
            token.options.from = sender.address

            const doPause = await token.pause()
            expect(doPause.from).to.be.equals(sender.address.toLowerCase())
            expect(doPause.status).to.be.true

            expect(await token.paused()).to.be.true

            await token.unpause({ from: sender.address })
        }).timeout(200000)

        it('should send transaction for pausing with sendParams(from)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const doPause = await token.pause({ from: sender.address })
            expect(doPause.from).to.be.equals(sender.address.toLowerCase())
            expect(doPause.status).to.be.true

            expect(await token.paused()).to.be.true

            await token.unpause({ from: sender.address })
        }).timeout(200000)

        it('should send transaction for pausing with sendParams(from, gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const customGasLimit = '0x30d40'
            const doPause = await token.pause({ from: sender.address, gas: customGasLimit })
            expect(doPause.gas).to.equals(customGasLimit)
            expect(doPause.from).to.be.equals(sender.address.toLowerCase())
            expect(doPause.status).to.be.true

            expect(await token.paused()).to.be.true

            await token.unpause({ from: sender.address })
        }).timeout(200000)

        it('should send transaction for pausing with sendParams(gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            // set deafult from address in kip7 instance
            token.options.from = sender.address

            const customGasLimit = '0x30d40'
            const doPause = await token.pause({ gas: customGasLimit })
            expect(doPause.from).to.be.equals(sender.address.toLowerCase())
            expect(doPause.status).to.be.true

            expect(await token.paused()).to.be.true

            await token.unpause({ from: sender.address })
        }).timeout(200000)
    })

    context('ERC721.unpause', () => {
        it('should send transaction for unpausing without sendParams', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            await token.pause({ from: sender.address })

            // set deafult from address in kip7 instance
            token.options.from = sender.address

            const doPause = await token.unpause()
            expect(doPause.from).to.be.equals(sender.address.toLowerCase())
            expect(doPause.status).to.be.true

            expect(await token.paused()).to.be.false
        }).timeout(200000)

        it('should send transaction for unpausing with sendParams(from)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            await token.pause({ from: sender.address })

            const doPause = await token.unpause({ from: sender.address })
            expect(doPause.from).to.be.equals(sender.address.toLowerCase())
            expect(doPause.status).to.be.true

            expect(await token.paused()).to.be.false
        }).timeout(200000)

        it('should send transaction for unpausing with sendParams(from, gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            await token.pause({ from: sender.address })

            const customGasLimit = '0x30d40'
            const doPause = await token.unpause({ from: sender.address, gas: customGasLimit })
            expect(doPause.gas).to.equals(customGasLimit)
            expect(doPause.from).to.be.equals(sender.address.toLowerCase())
            expect(doPause.status).to.be.true

            expect(await token.paused()).to.be.false
        }).timeout(200000)

        it('should send transaction for unpausing with sendParams(gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            await token.pause({ from: sender.address })

            // set deafult from address in kip7 instance
            token.options.from = sender.address

            const customGasLimit = '0x30d40'
            const doPause = await token.unpause({ gas: customGasLimit })
            expect(doPause.from).to.be.equals(sender.address.toLowerCase())
            expect(doPause.status).to.be.true

            expect(await token.paused()).to.be.false
        }).timeout(200000)
    })

    context('ERC721.addPauser', () => {
        it('should send transaction for adding pauser and trigger PauserAdded event without sendParams', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const newPauser = caver.klay.accounts.create().address
            expect(await token.isPauser(newPauser)).to.be.false

            // set deafult from address in kip7 instance
            token.options.from = sender.address

            const pauserAdded = await token.addPauser(newPauser)
            expect(pauserAdded.from).to.be.equals(sender.address.toLowerCase())
            expect(pauserAdded.status).to.be.true
            expect(pauserAdded.events).not.to.be.undefined
            expect(pauserAdded.events.PauserAdded).not.to.be.undefined
            expect(pauserAdded.events.PauserAdded.address).to.equals(nonFungibleTokenAddress)

            expect(await token.isPauser(newPauser)).to.be.true
        }).timeout(200000)

        it('should send transaction for adding pauser and trigger PauserAdded event with sendParams(from)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const newPauser = caver.klay.accounts.create().address
            expect(await token.isPauser(newPauser)).to.be.false

            const pauserAdded = await token.addPauser(newPauser, { from: sender.address })
            expect(pauserAdded.from).to.be.equals(sender.address.toLowerCase())
            expect(pauserAdded.status).to.be.true
            expect(pauserAdded.events).not.to.be.undefined
            expect(pauserAdded.events.PauserAdded).not.to.be.undefined
            expect(pauserAdded.events.PauserAdded.address).to.equals(nonFungibleTokenAddress)

            expect(await token.isPauser(newPauser)).to.be.true
        }).timeout(200000)

        it('should send transaction for adding pauser and trigger PauserAdded event with sendParams(from, gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const newPauser = caver.klay.accounts.create().address
            expect(await token.isPauser(newPauser)).to.be.false

            const customGasLimit = '0x493e0'
            const pauserAdded = await token.addPauser(newPauser, { from: sender.address, gas: customGasLimit })
            expect(pauserAdded.gas).to.equals(customGasLimit)
            expect(pauserAdded.from).to.be.equals(sender.address.toLowerCase())
            expect(pauserAdded.status).to.be.true
            expect(pauserAdded.events).not.to.be.undefined
            expect(pauserAdded.events.PauserAdded).not.to.be.undefined
            expect(pauserAdded.events.PauserAdded.address).to.equals(nonFungibleTokenAddress)

            expect(await token.isPauser(newPauser)).to.be.true
        }).timeout(200000)

        it('should send transaction for adding pauser and trigger PauserAdded event with sendParams(gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            const newPauser = caver.klay.accounts.create().address
            expect(await token.isPauser(newPauser)).to.be.false

            // set deafult from address in kip7 instance
            token.options.from = sender.address

            const customGasLimit = '0x493e0'
            const pauserAdded = await token.addPauser(newPauser, { gas: customGasLimit })
            expect(pauserAdded.from).to.be.equals(sender.address.toLowerCase())
            expect(pauserAdded.status).to.be.true
            expect(pauserAdded.events).not.to.be.undefined
            expect(pauserAdded.events.PauserAdded).not.to.be.undefined
            expect(pauserAdded.events.PauserAdded.address).to.equals(nonFungibleTokenAddress)

            expect(await token.isPauser(newPauser)).to.be.true
        }).timeout(200000)
    })

    context('ERC721.renouncePauser', () => {
        it('should send transaction for removing pauser and trigger PauserRemoved event without sendParams', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            await token.addPauser(testAccount.address, { from: sender.address })
            expect(await token.isPauser(testAccount.address)).to.be.true

            // set deafult from address in kip7 instance
            token.options.from = testAccount.address

            const pauserRemoved = await token.renouncePauser()
            expect(pauserRemoved.from).to.be.equals(testAccount.address.toLowerCase())
            expect(pauserRemoved.status).to.be.true
            expect(pauserRemoved.events).not.to.be.undefined
            expect(pauserRemoved.events.PauserRemoved).not.to.be.undefined
            expect(pauserRemoved.events.PauserRemoved.address).to.equals(nonFungibleTokenAddress)

            expect(await token.isPauser(testAccount.address)).to.be.false
        }).timeout(200000)

        it('should send transaction for removing pauser and trigger PauserRemoved event with sendParams(from)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            await token.addPauser(testAccount.address, { from: sender.address })
            expect(await token.isPauser(testAccount.address)).to.be.true

            const pauserRemoved = await token.renouncePauser({ from: testAccount.address })
            expect(pauserRemoved.from).to.be.equals(testAccount.address.toLowerCase())
            expect(pauserRemoved.status).to.be.true
            expect(pauserRemoved.events).not.to.be.undefined
            expect(pauserRemoved.events.PauserRemoved).not.to.be.undefined
            expect(pauserRemoved.events.PauserRemoved.address).to.equals(nonFungibleTokenAddress)

            expect(await token.isPauser(testAccount.address)).to.be.false
        }).timeout(200000)

        it('should send transaction for removing pauser and trigger PauserRemoved event with sendParams(from, gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            await token.addPauser(testAccount.address, { from: sender.address })
            expect(await token.isPauser(testAccount.address)).to.be.true

            const customGasLimit = '0x30d40'
            const pauserRemoved = await token.renouncePauser({ from: testAccount.address, gas: customGasLimit })
            expect(pauserRemoved.gas).to.equals(customGasLimit)
            expect(pauserRemoved.from).to.be.equals(testAccount.address.toLowerCase())
            expect(pauserRemoved.status).to.be.true
            expect(pauserRemoved.events).not.to.be.undefined
            expect(pauserRemoved.events.PauserRemoved).not.to.be.undefined
            expect(pauserRemoved.events.PauserRemoved.address).to.equals(nonFungibleTokenAddress)

            expect(await token.isPauser(testAccount.address)).to.be.false
        }).timeout(200000)

        it('should send transaction for removing pauser and trigger PauserRemoved event with sendParams(gas)', async () => {
            const token = new caver.klay.ERC721(nonFungibleTokenAddress)

            await token.addPauser(testAccount.address, { from: sender.address })
            expect(await token.isPauser(testAccount.address)).to.be.true

            // set deafult from address in kip7 instance
            token.options.from = testAccount.address

            const customGasLimit = '0x30d40'
            const pauserRemoved = await token.renouncePauser({ gas: customGasLimit })
            expect(pauserRemoved.from).to.be.equals(testAccount.address.toLowerCase())
            expect(pauserRemoved.status).to.be.true
            expect(pauserRemoved.events).not.to.be.undefined
            expect(pauserRemoved.events.PauserRemoved).not.to.be.undefined
            expect(pauserRemoved.events.PauserRemoved.address).to.equals(nonFungibleTokenAddress)

            expect(await token.isPauser(testAccount.address)).to.be.false
        }).timeout(200000)
    })
})
