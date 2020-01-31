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

let kip5Address

const tokenInfo = {
    name: 'Jasmine',
    symbol: 'JAS',
    decimals: 18,
    initialSupply: 100000,
}

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

describe('caver.klay.KIP5', () => {
    context('caver.klay.KIP5.deploy', () => {
        it('should deploy KIP5 token contract and return KIP5 instance', async () => {
            const deployed = await caver.klay.KIP5.deploy(tokenInfo, sender.address)

            expect(deployed.options.address).not.to.be.undefined

            const account = await caver.klay.getAccount(deployed.options.address)

            expect(account.accType).to.equals(2)
            expect(account.account.key.keyType).to.equals(3)

            kip5Address = deployed.options.address
        }).timeout(200000)

        it('should deploy KIP5 token contract and return KIP5 instance with ERC20 alias', async () => {
            const deployed = await caver.klay.ERC20.deploy(tokenInfo, sender.address)

            expect(deployed.options.address).not.to.be.undefined

            const account = await caver.klay.getAccount(deployed.options.address)

            expect(account.accType).to.equals(2)
            expect(account.account.key.keyType).to.equals(3)

            const kip5Account = await caver.klay.getAccount(kip5Address)
            expect(account.account.codeHash).to.equals(kip5Account.account.codeHash)
        }).timeout(200000)

        it('should throw error when token information is insufficient or invalid', async () => {
            let expectedError = 'Invalid name of token'
            let insufficientToken = {}
            let invalidToken = { name: 1 }
            expect(() => caver.klay.KIP5.deploy(insufficientToken, sender.address)).to.throws(expectedError)
            expect(() => caver.klay.KIP5.deploy(invalidToken, sender.address)).to.throws(expectedError)

            expectedError = 'Invalid symbol of token'
            insufficientToken = { name: 'Jasmine' }
            invalidToken = { name: 'Jasmine', symbol: 1 }
            expect(() => caver.klay.KIP5.deploy(insufficientToken, sender.address)).to.throws(expectedError)
            expect(() => caver.klay.KIP5.deploy(invalidToken, sender.address)).to.throws(expectedError)

            expectedError = 'Invalid decimals of token'
            insufficientToken = { name: 'Jasmine', symbol: 'JAS' }
            invalidToken = { name: 'Jasmine', symbol: 'JAS', decimals: [1234] }
            expect(() => caver.klay.KIP5.deploy(insufficientToken, sender.address)).to.throws(expectedError)
            expect(() => caver.klay.KIP5.deploy(invalidToken, sender.address)).to.throws(expectedError)

            expectedError = 'Invalid initialSupply of token'
            insufficientToken = { name: 'Jasmine', symbol: 'JAS', decimals: 18 }
            invalidToken = { name: 'Jasmine', symbol: 'JAS', decimals: 18, initialSupply: 'string' }
            expect(() => caver.klay.KIP5.deploy(insufficientToken, sender.address)).to.throws(expectedError)
            expect(() => caver.klay.KIP5.deploy(invalidToken, sender.address)).to.throws(expectedError)
        }).timeout(200000)
    })

    context('KIP5.clone', () => {
        it('should clone KIP5 instance with new token contract address', async () => {
            const token = new caver.klay.KIP5(kip5Address)

            const newTokenContract = caver.klay.accounts.create().address
            const cloned = token.clone(newTokenContract)

            expect(cloned.options.address).to.equals(newTokenContract)
            expect(cloned.options.address).not.to.equals(token.options.address)
        }).timeout(200000)
    })

    context('KIP5.name', () => {
        it('should call name method', async () => {
            const token = new caver.klay.KIP5(kip5Address)

            const name = await token.name()

            expect(name).to.equals(tokenInfo.name)
        }).timeout(200000)
    })

    context('KIP5.symbol', () => {
        it('should call symbol method', async () => {
            const token = new caver.klay.KIP5(kip5Address)

            const symbol = await token.symbol()

            expect(symbol).to.equals(tokenInfo.symbol)
        }).timeout(200000)
    })

    context('KIP5.decimals', () => {
        it('should call decimals method', async () => {
            const token = new caver.klay.KIP5(kip5Address)

            const decimals = await token.decimals()

            expect(decimals).to.equals(String(tokenInfo.decimals))
        }).timeout(200000)
    })

    context('KIP5.totalSupply', () => {
        it('should call totalSupply method', async () => {
            const token = new caver.klay.KIP5(kip5Address)

            const totalSupply = await token.totalSupply()

            expect(totalSupply).to.equals(String(tokenInfo.initialSupply))
        }).timeout(200000)
    })

    context('KIP5.balanceOf', () => {
        it('should call balanceOf method and deployer should have initialSupply', async () => {
            const token = new caver.klay.KIP5(kip5Address)

            const balance = await token.balanceOf(sender.address)

            expect(balance).to.equals(String(tokenInfo.initialSupply))
        }).timeout(200000)

        it('should call balanceOf method and return 0 if account does not have any token', async () => {
            const token = new caver.klay.KIP5(kip5Address)

            const balance = await token.balanceOf(caver.klay.accounts.create().address)

            expect(balance).to.equals('0')
        }).timeout(200000)
    })

    context('KIP5.allowance', () => {
        it('should call allowance method', async () => {
            const token = new caver.klay.KIP5(kip5Address)

            const allowance = await token.allowance(sender.address, testAccount.address)
            expect(allowance).to.equals('0')
        }).timeout(200000)
    })

    context('KIP5.approve', () => {
        it('should send transaction for calling approve method and set allowance without sendParams', async () => {
            const token = new caver.klay.KIP5(kip5Address)

            const allowanceAmount = 10
            const originalAllowance = await token.allowance(sender.address, testAccount.address)

            // set deafult from address in kip5 instance
            token.options.from = sender.address

            const approved = await token.approve(testAccount.address, allowanceAmount)
            expect(approved.from).to.be.equals(sender.address.toLowerCase())
            expect(approved.status).to.be.true
            expect(approved.events).not.to.be.undefined
            expect(approved.events.Approval).not.to.be.undefined
            expect(approved.events.Approval.address).to.equals(kip5Address)

            const afterAllowance = await token.allowance(sender.address, testAccount.address)

            expect(Number(afterAllowance) - Number(originalAllowance)).to.equals(allowanceAmount)
        }).timeout(200000)

        it('should send transaction for calling approve method and set allowance with sendParams(from)', async () => {
            const token = new caver.klay.KIP5(kip5Address)

            const additionalAllowance = 10
            const originalAllowance = await token.allowance(sender.address, testAccount.address)

            const newAllowance = additionalAllowance + Number(originalAllowance)

            const approved = await token.approve(testAccount.address, newAllowance, { from: sender.address })
            expect(approved.from).to.be.equals(sender.address.toLowerCase())
            expect(approved.status).to.be.true
            expect(approved.events).not.to.be.undefined
            expect(approved.events.Approval).not.to.be.undefined
            expect(approved.events.Approval.address).to.equals(kip5Address)

            const afterAllowance = await token.allowance(sender.address, testAccount.address)

            expect(Number(afterAllowance) - Number(originalAllowance)).to.equals(additionalAllowance)
        }).timeout(200000)

        it('should send transaction for calling approve method and set allowance with sendParams(from, gas)', async () => {
            const token = new caver.klay.KIP5(kip5Address)

            const additionalAllowance = 10
            const originalAllowance = await token.allowance(sender.address, testAccount.address)

            const newAllowance = additionalAllowance + Number(originalAllowance)

            const customGasLimit = '0x186a0'

            const approved = await token.approve(testAccount.address, newAllowance, { from: sender.address, gas: customGasLimit })
            expect(approved.gas).to.equals(customGasLimit)
            expect(approved.status).to.be.true
            expect(approved.events).not.to.be.undefined
            expect(approved.events.Approval).not.to.be.undefined
            expect(approved.events.Approval.address).to.equals(kip5Address)

            const afterAllowance = await token.allowance(sender.address, testAccount.address)

            expect(Number(afterAllowance) - Number(originalAllowance)).to.equals(additionalAllowance)
        }).timeout(200000)

        it('should send transaction for calling approve method and set allowance with sendParams(gas)', async () => {
            const token = new caver.klay.KIP5(kip5Address)

            const additionalAllowance = 10
            const originalAllowance = await token.allowance(sender.address, testAccount.address)

            const newAllowance = additionalAllowance + Number(originalAllowance)

            const customGasLimit = '0x186a0'

            // set deafult from address in kip5 instance
            token.options.from = sender.address

            const approved = await token.approve(testAccount.address, newAllowance, { gas: customGasLimit })
            expect(approved.from).to.be.equals(sender.address.toLowerCase())
            expect(approved.gas).to.equals(customGasLimit)
            expect(approved.status).to.be.true
            expect(approved.events).not.to.be.undefined
            expect(approved.events.Approval).not.to.be.undefined
            expect(approved.events.Approval.address).to.equals(kip5Address)

            const afterAllowance = await token.allowance(sender.address, testAccount.address)

            expect(Number(afterAllowance) - Number(originalAllowance)).to.equals(additionalAllowance)
        }).timeout(200000)
    })

    context('KIP5.transfer', () => {
        it('should send transaction to transfer token and trigger Transfer event without sendParams', async () => {
            const token = new caver.klay.KIP5(kip5Address)

            const transferAmount = 10
            const originalBalance = await token.balanceOf(testAccount.address)

            // set deafult from address in kip5 instance
            token.options.from = sender.address

            const transfered = await token.transfer(testAccount.address, transferAmount)
            expect(transfered.from).to.be.equals(sender.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(kip5Address)

            const afterBalance = await token.balanceOf(testAccount.address)

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(transferAmount)
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(from)', async () => {
            const token = new caver.klay.KIP5(kip5Address)

            const transferAmount = 10
            const originalBalance = await token.balanceOf(testAccount.address)

            const transfered = await token.transfer(testAccount.address, transferAmount, { from: sender.address })
            expect(transfered.from).to.be.equals(sender.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(kip5Address)

            const afterBalance = await token.balanceOf(testAccount.address)

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(transferAmount)
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(from, gas)', async () => {
            const token = new caver.klay.KIP5(kip5Address)

            const transferAmount = 10
            const originalBalance = await token.balanceOf(testAccount.address)

            const customGasLimit = '0x186a0'

            const transfered = await token.transfer(testAccount.address, transferAmount, { from: sender.address, gas: customGasLimit })
            expect(transfered.gas).to.equals(customGasLimit)
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(kip5Address)

            const afterBalance = await token.balanceOf(testAccount.address)

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(transferAmount)
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(gas)', async () => {
            const token = new caver.klay.KIP5(kip5Address)

            const transferAmount = 10
            const originalBalance = await token.balanceOf(testAccount.address)

            const customGasLimit = '0x186a0'

            // set deafult from address in kip5 instance
            token.options.from = sender.address

            const transfered = await token.transfer(testAccount.address, transferAmount, { gas: customGasLimit })
            expect(transfered.from).to.be.equals(sender.address.toLowerCase())
            expect(transfered.gas).to.equals(customGasLimit)
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(kip5Address)

            const afterBalance = await token.balanceOf(testAccount.address)

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(transferAmount)
        }).timeout(200000)
    })

    context('KIP5.transferFrom', () => {
        it('should send transaction to transfer token and trigger Transfer event without sendParams', async () => {
            const token = new caver.klay.KIP5(kip5Address)

            const originalBalance = await token.balanceOf(receiver.address)

            const allowanceAmount = 10000
            await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
            const originalAllowance = await token.allowance(sender.address, testAccount.address)
            expect(Number(originalAllowance)).to.be.equals(allowanceAmount)

            // set deafult from address in kip5 instance
            token.options.from = testAccount.address

            const transfered = await token.transferFrom(sender.address, receiver.address, allowanceAmount)
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(kip5Address)

            const afterBalance = await token.balanceOf(receiver.address)
            expect(await token.allowance(sender.address, testAccount.address)).to.be.equals('0')

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(allowanceAmount)
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(from)', async () => {
            const token = new caver.klay.KIP5(kip5Address)

            const originalBalance = await token.balanceOf(receiver.address)

            const allowanceAmount = 10000
            await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
            const originalAllowance = await token.allowance(sender.address, testAccount.address)
            expect(Number(originalAllowance)).to.be.equals(allowanceAmount)

            // set deafult from address in kip5 instance
            token.options.from = testAccount.address

            const transfered = await token.transferFrom(sender.address, receiver.address, allowanceAmount, { from: testAccount.address })
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(kip5Address)

            const afterBalance = await token.balanceOf(receiver.address)
            expect(await token.allowance(sender.address, testAccount.address)).to.be.equals('0')

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(allowanceAmount)
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(from, gas)', async () => {
            const token = new caver.klay.KIP5(kip5Address)

            const originalBalance = await token.balanceOf(receiver.address)

            const allowanceAmount = 10000
            await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
            const originalAllowance = await token.allowance(sender.address, testAccount.address)
            expect(Number(originalAllowance)).to.be.equals(allowanceAmount)

            const customGasLimit = '0x186a0'
            const transfered = await token.transferFrom(sender.address, receiver.address, allowanceAmount, {
                from: testAccount.address,
                gas: customGasLimit,
            })
            expect(transfered.gas).to.equals(customGasLimit)
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(kip5Address)

            const afterBalance = await token.balanceOf(receiver.address)
            expect(await token.allowance(sender.address, testAccount.address)).to.be.equals('0')

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(allowanceAmount)
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(gas)', async () => {
            const token = new caver.klay.KIP5(kip5Address)

            const originalBalance = await token.balanceOf(receiver.address)

            const allowanceAmount = 10000
            await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
            const originalAllowance = await token.allowance(sender.address, testAccount.address)
            expect(Number(originalAllowance)).to.be.equals(allowanceAmount)

            // set deafult from address in kip5 instance
            token.options.from = testAccount.address

            const customGasLimit = '0x186a0'
            const transfered = await token.transferFrom(sender.address, receiver.address, allowanceAmount, { gas: customGasLimit })
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.gas).to.equals(customGasLimit)
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(kip5Address)

            const afterBalance = await token.balanceOf(receiver.address)
            expect(await token.allowance(sender.address, testAccount.address)).to.be.equals('0')

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(allowanceAmount)
        }).timeout(200000)
    })
})
