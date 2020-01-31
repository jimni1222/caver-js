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

let simpleAddress
let fullAddress

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

describe('caver.klay.ERC20', () => {
    context('caver.klay.ERC20.deploy', () => {
        it('should deploy simple erc20 token contract and return ERC20Full instance', async () => {
            const deployed = await caver.klay.ERC20.deploy(tokenInfo, sender.address)

            expect(deployed.type).to.equals('ERC20_Full')
            expect(deployed.options.address).not.to.be.undefined

            const account = await caver.klay.getAccount(deployed.options.address)

            expect(account.accType).to.equals(2)
            expect(account.account.key.keyType).to.equals(3)
            expect(account.account.codeHash).to.equals(caver.klay.ERC20.CODE_HASH.FULL)

            fullAddress = deployed.options.address
        }).timeout(200000)

        it('should throw error when token information is insufficient or invalid', async () => {
            let expectedError = 'Invalid name of token'
            let insufficientToken = {}
            let invalidToken = { name: 1 }
            expect(() => caver.klay.ERC20.deploy(insufficientToken, sender.address)).to.throws(expectedError)
            expect(() => caver.klay.ERC20.deploy(invalidToken, sender.address)).to.throws(expectedError)

            expectedError = 'Invalid symbol of token'
            insufficientToken = { name: 'Jasmine' }
            invalidToken = { name: 'Jasmine', symbol: 1 }
            expect(() => caver.klay.ERC20.deploy(insufficientToken, sender.address)).to.throws(expectedError)
            expect(() => caver.klay.ERC20.deploy(invalidToken, sender.address)).to.throws(expectedError)

            expectedError = 'Invalid decimals of token'
            insufficientToken = { name: 'Jasmine', symbol: 'JAS' }
            invalidToken = { name: 'Jasmine', symbol: 'JAS', decimals: [1234] }
            expect(() => caver.klay.ERC20.deploy(insufficientToken, sender.address)).to.throws(expectedError)
            expect(() => caver.klay.ERC20.deploy(invalidToken, sender.address)).to.throws(expectedError)

            expectedError = 'Invalid initialSupply of token'
            insufficientToken = { name: 'Jasmine', symbol: 'JAS', decimals: 18 }
            invalidToken = { name: 'Jasmine', symbol: 'JAS', decimals: 18, initialSupply: 'string' }
            expect(() => caver.klay.ERC20.deploy(insufficientToken, sender.address)).to.throws(expectedError)
            expect(() => caver.klay.ERC20.deploy(invalidToken, sender.address)).to.throws(expectedError)
        }).timeout(200000)
    })

    context('caver.klay.ERC20.deploySimple', () => {
        it('should deploy simple erc20 token contract and return ERC20Simple instance', async () => {
            const deployed = await caver.klay.ERC20.deploySimple(tokenInfo, sender.address)

            expect(deployed.type).to.equals('ERC20_Simple')
            expect(deployed.options.address).not.to.be.undefined

            const account = await caver.klay.getAccount(deployed.options.address)

            expect(account.accType).to.equals(2)
            expect(account.account.key.keyType).to.equals(3)
            expect(account.account.codeHash).to.equals(caver.klay.ERC20.CODE_HASH.SIMPLE)

            simpleAddress = deployed.options.address
        }).timeout(200000)

        it('should throw error when token information is insufficient or invalid', async () => {
            let expectedError = 'Invalid name of token'
            let insufficientToken = {}
            let invalidToken = { name: 1 }
            expect(() => caver.klay.ERC20.deploySimple(insufficientToken, sender.address)).to.throws(expectedError)
            expect(() => caver.klay.ERC20.deploySimple(invalidToken, sender.address)).to.throws(expectedError)

            expectedError = 'Invalid symbol of token'
            insufficientToken = { name: 'Jasmine' }
            invalidToken = { name: 'Jasmine', symbol: 1 }
            expect(() => caver.klay.ERC20.deploySimple(insufficientToken, sender.address)).to.throws(expectedError)
            expect(() => caver.klay.ERC20.deploySimple(invalidToken, sender.address)).to.throws(expectedError)

            expectedError = 'Invalid decimals of token'
            insufficientToken = { name: 'Jasmine', symbol: 'JAS' }
            invalidToken = { name: 'Jasmine', symbol: 'JAS', decimals: [1234] }
            expect(() => caver.klay.ERC20.deploySimple(insufficientToken, sender.address)).to.throws(expectedError)
            expect(() => caver.klay.ERC20.deploySimple(invalidToken, sender.address)).to.throws(expectedError)

            expectedError = 'Invalid initialSupply of token'
            insufficientToken = { name: 'Jasmine', symbol: 'JAS', decimals: 18 }
            invalidToken = { name: 'Jasmine', symbol: 'JAS', decimals: 18, initialSupply: 'string' }
            expect(() => caver.klay.ERC20.deploySimple(insufficientToken, sender.address)).to.throws(expectedError)
            expect(() => caver.klay.ERC20.deploySimple(invalidToken, sender.address)).to.throws(expectedError)
        }).timeout(200000)
    })

    context('caver.klay.ERC20.create', () => {
        it('should return ERC20Full instance when code hash of contract is same with code hash of ERC20Full', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            expect(token.type).to.equals('ERC20_Full')
        }).timeout(200000)

        it('should return ERC20Simple instance when code hash of contract is same with code hash of ERC20Simple', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

            expect(token.type).to.equals('ERC20_Simple')
        }).timeout(200000)

        it('should throw error with invalid address', async () => {
            const invalidTokenAddress = 'This is not address'
            const expectedError = `Invalid token contract address (${invalidTokenAddress}).`

            await expect(caver.klay.ERC20.create(invalidTokenAddress)).to.be.rejectedWith(expectedError)
        }).timeout(200000)

        it('should throw error with EOA', async () => {
            const invalidTokenAddress = sender.address
            const expectedError = `Invalid token contract (${invalidTokenAddress}). The account type should be 2 but got 1`

            await expect(caver.klay.ERC20.create(invalidTokenAddress)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })
})

describe('ERC20Simple', () => {
    context('erc20Simple.clone', () => {
        it('should clone ERC20Simple instance with new token contract address', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

            const newTokenContract = caver.klay.accounts.create().address
            const cloned = token.clone(newTokenContract)

            expect(cloned.type).to.equals('ERC20_Simple')
            expect(cloned.options.address).to.equals(newTokenContract)
            expect(cloned.options.address).not.to.equals(token.options.address)
        }).timeout(200000)
    })

    context('erc20Simple.name', () => {
        it('should call name method', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

            const name = await token.name()

            expect(name).to.equals(tokenInfo.name)
        }).timeout(200000)
    })

    context('erc20Simple.symbol', () => {
        it('should call symbol method', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

            const symbol = await token.symbol()

            expect(symbol).to.equals(tokenInfo.symbol)
        }).timeout(200000)
    })

    context('erc20Simple.decimals', () => {
        it('should call decimals method', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

            const decimals = await token.decimals()

            expect(decimals).to.equals(String(tokenInfo.decimals))
        }).timeout(200000)
    })

    context('erc20Simple.totalSupply', () => {
        it('should call totalSupply method', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

            const totalSupply = await token.totalSupply()

            expect(totalSupply).to.equals(String(tokenInfo.initialSupply))
        }).timeout(200000)
    })

    context('erc20Simple.balanceOf', () => {
        it('should call balanceOf method and deployer should have initialSupply', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

            const balance = await token.balanceOf(sender.address)

            expect(balance).to.equals(String(tokenInfo.initialSupply))
        }).timeout(200000)

        it('should call balanceOf method and return 0 if account does not have any token', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

            const balance = await token.balanceOf(caver.klay.accounts.create().address)

            expect(balance).to.equals('0')
        }).timeout(200000)
    })

    context('erc20Simple.allowance', () => {
        it('should call allowance method', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

            const allowance = await token.allowance(sender.address, testAccount.address)
            expect(allowance).to.equals('0')
        }).timeout(200000)
    })

    context('erc20Simple.approve', () => {
        it('should send transaction for calling approve method and set allowance without sendParams', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

            const allowanceAmount = 10
            const originalAllowance = await token.allowance(sender.address, testAccount.address)

            // set deafult from address in erc20 instance
            token.options.from = sender.address

            const approved = await token.approve(testAccount.address, allowanceAmount)
            expect(approved.from).to.be.equals(sender.address.toLowerCase())
            expect(approved.status).to.be.true
            expect(approved.events).not.to.be.undefined
            expect(approved.events.Approval).not.to.be.undefined
            expect(approved.events.Approval.address).to.equals(simpleAddress)

            const afterAllowance = await token.allowance(sender.address, testAccount.address)

            expect(Number(afterAllowance) - Number(originalAllowance)).to.equals(allowanceAmount)
        }).timeout(200000)

        it('should send transaction for calling approve method and set allowance with sendParams(from)', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

            const additionalAllowance = 10
            const originalAllowance = await token.allowance(sender.address, testAccount.address)

            const newAllowance = additionalAllowance + Number(originalAllowance)

            const approved = await token.approve(testAccount.address, newAllowance, { from: sender.address })
            expect(approved.from).to.be.equals(sender.address.toLowerCase())
            expect(approved.status).to.be.true
            expect(approved.events).not.to.be.undefined
            expect(approved.events.Approval).not.to.be.undefined
            expect(approved.events.Approval.address).to.equals(simpleAddress)

            const afterAllowance = await token.allowance(sender.address, testAccount.address)

            expect(Number(afterAllowance) - Number(originalAllowance)).to.equals(additionalAllowance)
        }).timeout(200000)

        it('should send transaction for calling approve method and set allowance with sendParams(from, gas)', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

            const additionalAllowance = 10
            const originalAllowance = await token.allowance(sender.address, testAccount.address)

            const newAllowance = additionalAllowance + Number(originalAllowance)

            const customGasLimit = '0x186a0'

            const approved = await token.approve(testAccount.address, newAllowance, { from: sender.address, gas: customGasLimit })
            expect(approved.gas).to.equals(customGasLimit)
            expect(approved.status).to.be.true
            expect(approved.events).not.to.be.undefined
            expect(approved.events.Approval).not.to.be.undefined
            expect(approved.events.Approval.address).to.equals(simpleAddress)

            const afterAllowance = await token.allowance(sender.address, testAccount.address)

            expect(Number(afterAllowance) - Number(originalAllowance)).to.equals(additionalAllowance)
        }).timeout(200000)

        it('should send transaction for calling approve method and set allowance with sendParams(gas)', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

            const additionalAllowance = 10
            const originalAllowance = await token.allowance(sender.address, testAccount.address)

            const newAllowance = additionalAllowance + Number(originalAllowance)

            const customGasLimit = '0x186a0'

            // set deafult from address in erc20 instance
            token.options.from = sender.address

            const approved = await token.approve(testAccount.address, newAllowance, { gas: customGasLimit })
            expect(approved.from).to.be.equals(sender.address.toLowerCase())
            expect(approved.gas).to.equals(customGasLimit)
            expect(approved.status).to.be.true
            expect(approved.events).not.to.be.undefined
            expect(approved.events.Approval).not.to.be.undefined
            expect(approved.events.Approval.address).to.equals(simpleAddress)

            const afterAllowance = await token.allowance(sender.address, testAccount.address)

            expect(Number(afterAllowance) - Number(originalAllowance)).to.equals(additionalAllowance)
        }).timeout(200000)
    })

    context('erc20Simple.transfer', () => {
        it('should send transaction to transfer token and trigger Transfer event without sendParams', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

            const transferAmount = 10
            const originalBalance = await token.balanceOf(testAccount.address)

            // set deafult from address in erc20 instance
            token.options.from = sender.address

            const transfered = await token.transfer(testAccount.address, transferAmount)
            expect(transfered.from).to.be.equals(sender.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(simpleAddress)

            const afterBalance = await token.balanceOf(testAccount.address)

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(transferAmount)
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(from)', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

            const transferAmount = 10
            const originalBalance = await token.balanceOf(testAccount.address)

            const transfered = await token.transfer(testAccount.address, transferAmount, { from: sender.address })
            expect(transfered.from).to.be.equals(sender.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(simpleAddress)

            const afterBalance = await token.balanceOf(testAccount.address)

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(transferAmount)
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(from, gas)', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

            const transferAmount = 10
            const originalBalance = await token.balanceOf(testAccount.address)

            const customGasLimit = '0x186a0'

            const transfered = await token.transfer(testAccount.address, transferAmount, { from: sender.address, gas: customGasLimit })
            expect(transfered.gas).to.equals(customGasLimit)
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(simpleAddress)

            const afterBalance = await token.balanceOf(testAccount.address)

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(transferAmount)
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(gas)', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

            const transferAmount = 10
            const originalBalance = await token.balanceOf(testAccount.address)

            const customGasLimit = '0x186a0'

            // set deafult from address in erc20 instance
            token.options.from = sender.address

            const transfered = await token.transfer(testAccount.address, transferAmount, { gas: customGasLimit })
            expect(transfered.from).to.be.equals(sender.address.toLowerCase())
            expect(transfered.gas).to.equals(customGasLimit)
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(simpleAddress)

            const afterBalance = await token.balanceOf(testAccount.address)

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(transferAmount)
        }).timeout(200000)
    })

    context('erc20Simple.transferFrom', () => {
        it('should send transaction to transfer token and trigger Transfer event without sendParams', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

            const originalBalance = await token.balanceOf(receiver.address)

            const allowanceAmount = 10000
            await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
            const originalAllowance = await token.allowance(sender.address, testAccount.address)
            expect(Number(originalAllowance)).to.be.equals(allowanceAmount)

            // set deafult from address in erc20 instance
            token.options.from = testAccount.address

            const transfered = await token.transferFrom(sender.address, receiver.address, allowanceAmount)
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(simpleAddress)

            const afterBalance = await token.balanceOf(receiver.address)
            expect(await token.allowance(sender.address, testAccount.address)).to.be.equals('0')

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(allowanceAmount)
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(from)', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

            const originalBalance = await token.balanceOf(receiver.address)

            const allowanceAmount = 10000
            await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
            const originalAllowance = await token.allowance(sender.address, testAccount.address)
            expect(Number(originalAllowance)).to.be.equals(allowanceAmount)

            // set deafult from address in erc20 instance
            token.options.from = testAccount.address

            const transfered = await token.transferFrom(sender.address, receiver.address, allowanceAmount, { from: testAccount.address })
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(simpleAddress)

            const afterBalance = await token.balanceOf(receiver.address)
            expect(await token.allowance(sender.address, testAccount.address)).to.be.equals('0')

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(allowanceAmount)
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(from, gas)', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

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
            expect(transfered.events.Transfer.address).to.equals(simpleAddress)

            const afterBalance = await token.balanceOf(receiver.address)
            expect(await token.allowance(sender.address, testAccount.address)).to.be.equals('0')

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(allowanceAmount)
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(gas)', async () => {
            const token = await caver.klay.ERC20.create(simpleAddress)

            const originalBalance = await token.balanceOf(receiver.address)

            const allowanceAmount = 10000
            await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
            const originalAllowance = await token.allowance(sender.address, testAccount.address)
            expect(Number(originalAllowance)).to.be.equals(allowanceAmount)

            // set deafult from address in erc20 instance
            token.options.from = testAccount.address

            const customGasLimit = '0x186a0'
            const transfered = await token.transferFrom(sender.address, receiver.address, allowanceAmount, { gas: customGasLimit })
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.gas).to.equals(customGasLimit)
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(simpleAddress)

            const afterBalance = await token.balanceOf(receiver.address)
            expect(await token.allowance(sender.address, testAccount.address)).to.be.equals('0')

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(allowanceAmount)
        }).timeout(200000)
    })
})

describe('ERC20Full', () => {
    context('erc20Full.clone', () => {
        it('should clone ERC20Full instance with new token contract address', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const newTokenContract = caver.klay.accounts.create().address
            const cloned = token.clone(newTokenContract)

            expect(cloned.type).to.equals('ERC20_Full')
            expect(cloned.options.address).to.equals(newTokenContract)
            expect(cloned.options.address).not.to.equals(token.options.address)
        }).timeout(200000)
    })

    // ERC20Full can use functions implemented in ERC20Simple
    context('erc20Full.name', () => {
        it('should call name method', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const name = await token.name()

            expect(name).to.equals(tokenInfo.name)
        }).timeout(200000)
    })

    context('erc20Full.symbol', () => {
        it('should call symbol method', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const symbol = await token.symbol()

            expect(symbol).to.equals(tokenInfo.symbol)
        }).timeout(200000)
    })

    context('erc20Full.decimals', () => {
        it('should call decimals method', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const decimals = await token.decimals()

            expect(decimals).to.equals(String(tokenInfo.decimals))
        }).timeout(200000)
    })

    context('erc20Full.totalSupply', () => {
        it('should call totalSupply method', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const totalSupply = await token.totalSupply()

            expect(totalSupply).to.equals(String(tokenInfo.initialSupply))
        }).timeout(200000)
    })

    context('erc20Full.balanceOf', () => {
        it('should call balanceOf method and deployer should have initialSupply', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const balance = await token.balanceOf(sender.address)

            expect(balance).to.equals(String(tokenInfo.initialSupply))
        }).timeout(200000)

        it('should call balanceOf method and return 0 if account does not have any token', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const balance = await token.balanceOf(caver.klay.accounts.create().address)

            expect(balance).to.equals('0')
        }).timeout(200000)
    })

    context('erc20Full.allowance', () => {
        it('should call allowance method', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const allowance = await token.allowance(sender.address, testAccount.address)
            expect(allowance).to.equals('0')
        }).timeout(200000)
    })

    context('erc20Full.approve', () => {
        it('should send transaction for calling approve method and set allowance without sendParams', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const allowanceAmount = 10
            const originalAllowance = await token.allowance(sender.address, testAccount.address)

            // set deafult from address in erc20 instance
            token.options.from = sender.address

            const approved = await token.approve(testAccount.address, allowanceAmount)
            expect(approved.from).to.be.equals(sender.address.toLowerCase())
            expect(approved.status).to.be.true
            expect(approved.events).not.to.be.undefined
            expect(approved.events.Approval).not.to.be.undefined
            expect(approved.events.Approval.address).to.equals(fullAddress)

            const afterAllowance = await token.allowance(sender.address, testAccount.address)

            expect(Number(afterAllowance) - Number(originalAllowance)).to.equals(allowanceAmount)
        }).timeout(200000)

        it('should send transaction for calling approve method and set allowance with sendParams(from)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const additionalAllowance = 10
            const originalAllowance = await token.allowance(sender.address, testAccount.address)

            const newAllowance = additionalAllowance + Number(originalAllowance)

            const approved = await token.approve(testAccount.address, newAllowance, { from: sender.address })
            expect(approved.from).to.be.equals(sender.address.toLowerCase())
            expect(approved.status).to.be.true
            expect(approved.events).not.to.be.undefined
            expect(approved.events.Approval).not.to.be.undefined
            expect(approved.events.Approval.address).to.equals(fullAddress)

            const afterAllowance = await token.allowance(sender.address, testAccount.address)

            expect(Number(afterAllowance) - Number(originalAllowance)).to.equals(additionalAllowance)
        }).timeout(200000)

        it('should send transaction for calling approve method and set allowance with sendParams(from, gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const additionalAllowance = 10
            const originalAllowance = await token.allowance(sender.address, testAccount.address)

            const newAllowance = additionalAllowance + Number(originalAllowance)

            const customGasLimit = '0x186a0'

            const approved = await token.approve(testAccount.address, newAllowance, { from: sender.address, gas: customGasLimit })
            expect(approved.gas).to.equals(customGasLimit)
            expect(approved.status).to.be.true
            expect(approved.events).not.to.be.undefined
            expect(approved.events.Approval).not.to.be.undefined
            expect(approved.events.Approval.address).to.equals(fullAddress)

            const afterAllowance = await token.allowance(sender.address, testAccount.address)

            expect(Number(afterAllowance) - Number(originalAllowance)).to.equals(additionalAllowance)
        }).timeout(200000)

        it('should send transaction for calling approve method and set allowance with sendParams(gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const additionalAllowance = 10
            const originalAllowance = await token.allowance(sender.address, testAccount.address)

            const newAllowance = additionalAllowance + Number(originalAllowance)

            const customGasLimit = '0x186a0'

            // set deafult from address in erc20 instance
            token.options.from = sender.address

            const approved = await token.approve(testAccount.address, newAllowance, { gas: customGasLimit })
            expect(approved.from).to.be.equals(sender.address.toLowerCase())
            expect(approved.gas).to.equals(customGasLimit)
            expect(approved.status).to.be.true
            expect(approved.events).not.to.be.undefined
            expect(approved.events.Approval).not.to.be.undefined
            expect(approved.events.Approval.address).to.equals(fullAddress)

            const afterAllowance = await token.allowance(sender.address, testAccount.address)

            expect(Number(afterAllowance) - Number(originalAllowance)).to.equals(additionalAllowance)
        }).timeout(200000)
    })

    context('erc20Full.transfer', () => {
        it('should send transaction to transfer token and trigger Transfer event without sendParams', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const transferAmount = 10
            const originalBalance = await token.balanceOf(testAccount.address)

            // set deafult from address in erc20 instance
            token.options.from = sender.address

            const transfered = await token.transfer(testAccount.address, transferAmount)
            expect(transfered.from).to.be.equals(sender.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(fullAddress)

            const afterBalance = await token.balanceOf(testAccount.address)

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(transferAmount)
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(from)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const transferAmount = 10
            const originalBalance = await token.balanceOf(testAccount.address)

            const transfered = await token.transfer(testAccount.address, transferAmount, { from: sender.address })
            expect(transfered.from).to.be.equals(sender.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(fullAddress)

            const afterBalance = await token.balanceOf(testAccount.address)

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(transferAmount)
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(from, gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const transferAmount = 10
            const originalBalance = await token.balanceOf(testAccount.address)

            const customGasLimit = '0x186a0'

            const transfered = await token.transfer(testAccount.address, transferAmount, { from: sender.address, gas: customGasLimit })
            expect(transfered.gas).to.equals(customGasLimit)
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(fullAddress)

            const afterBalance = await token.balanceOf(testAccount.address)

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(transferAmount)
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const transferAmount = 10
            const originalBalance = await token.balanceOf(testAccount.address)

            const customGasLimit = '0x186a0'

            // set deafult from address in erc20 instance
            token.options.from = sender.address

            const transfered = await token.transfer(testAccount.address, transferAmount, { gas: customGasLimit })
            expect(transfered.from).to.be.equals(sender.address.toLowerCase())
            expect(transfered.gas).to.equals(customGasLimit)
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(fullAddress)

            const afterBalance = await token.balanceOf(testAccount.address)

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(transferAmount)
        }).timeout(200000)
    })

    context('erc20Full.transferFrom', () => {
        it('should send transaction to transfer token and trigger Transfer event without sendParams', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const originalBalance = await token.balanceOf(receiver.address)

            const allowanceAmount = 10000
            await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
            const originalAllowance = await token.allowance(sender.address, testAccount.address)
            expect(Number(originalAllowance)).to.be.equals(allowanceAmount)

            // set deafult from address in erc20 instance
            token.options.from = testAccount.address

            const transfered = await token.transferFrom(sender.address, receiver.address, allowanceAmount)
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(fullAddress)

            const afterBalance = await token.balanceOf(receiver.address)
            expect(await token.allowance(sender.address, testAccount.address)).to.be.equals('0')

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(allowanceAmount)
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(from)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const originalBalance = await token.balanceOf(receiver.address)

            const allowanceAmount = 10000
            await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
            const originalAllowance = await token.allowance(sender.address, testAccount.address)
            expect(Number(originalAllowance)).to.be.equals(allowanceAmount)

            // set deafult from address in erc20 instance
            token.options.from = testAccount.address

            const transfered = await token.transferFrom(sender.address, receiver.address, allowanceAmount, { from: testAccount.address })
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(fullAddress)

            const afterBalance = await token.balanceOf(receiver.address)
            expect(await token.allowance(sender.address, testAccount.address)).to.be.equals('0')

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(allowanceAmount)
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(from, gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

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
            expect(transfered.events.Transfer.address).to.equals(fullAddress)

            const afterBalance = await token.balanceOf(receiver.address)
            expect(await token.allowance(sender.address, testAccount.address)).to.be.equals('0')

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(allowanceAmount)
        }).timeout(200000)

        it('should send transaction to transfer token and trigger Transfer event with sendParams(gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const originalBalance = await token.balanceOf(receiver.address)

            const allowanceAmount = 10000
            await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
            const originalAllowance = await token.allowance(sender.address, testAccount.address)
            expect(Number(originalAllowance)).to.be.equals(allowanceAmount)

            // set deafult from address in erc20 instance
            token.options.from = testAccount.address

            const customGasLimit = '0x186a0'
            const transfered = await token.transferFrom(sender.address, receiver.address, allowanceAmount, { gas: customGasLimit })
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.gas).to.equals(customGasLimit)
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(fullAddress)

            const afterBalance = await token.balanceOf(receiver.address)
            expect(await token.allowance(sender.address, testAccount.address)).to.be.equals('0')

            expect(Number(afterBalance) - Number(originalBalance)).to.equals(allowanceAmount)
        }).timeout(200000)
    })

    // Below test codes are for extended functions
    context('erc20Full.isMinter', () => {
        it('should call isMinter method', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            expect(await token.isMinter(sender.address)).to.be.true
            expect(await token.isMinter(testAccount.address)).to.be.false
        }).timeout(200000)
    })

    context('erc20Full.isPauser', () => {
        it('should call isPauser method', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            expect(await token.isPauser(sender.address)).to.be.true
            expect(await token.isPauser(testAccount.address)).to.be.false
        }).timeout(200000)
    })

    context('erc20Full.paused', () => {
        it('should call paused method', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            expect(await token.paused()).to.be.false

            await token.pause({ from: sender.address })

            expect(await token.paused()).to.be.true

            await token.unpause({ from: sender.address })

            expect(await token.paused()).to.be.false
        }).timeout(200000)
    })

    context('erc20Full.mint', () => {
        it('should send transaction for minting and trigger Transfer event without sendParams', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const originalSupply = await token.totalSupply()

            // set deafult from address in erc20 instance
            token.options.from = sender.address

            const mintingAmount = 10000
            const minted = await token.mint(testAccount.address, mintingAmount)
            expect(minted.from).to.be.equals(sender.address.toLowerCase())
            expect(minted.status).to.be.true
            expect(minted.events).not.to.be.undefined
            expect(minted.events.Transfer).not.to.be.undefined
            expect(minted.events.Transfer.address).to.equals(fullAddress)

            const afterSupply = await token.totalSupply()

            expect(Number(afterSupply) - Number(originalSupply)).to.equals(mintingAmount)
        }).timeout(200000)

        it('should send transaction for minting and trigger Transfer event with sendParams(from)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const originalSupply = await token.totalSupply()

            const mintingAmount = 10000
            const minted = await token.mint(testAccount.address, mintingAmount, { from: sender.address })
            expect(minted.from).to.be.equals(sender.address.toLowerCase())
            expect(minted.status).to.be.true
            expect(minted.events).not.to.be.undefined
            expect(minted.events.Transfer).not.to.be.undefined
            expect(minted.events.Transfer.address).to.equals(fullAddress)

            const afterSupply = await token.totalSupply()

            expect(Number(afterSupply) - Number(originalSupply)).to.equals(mintingAmount)
        }).timeout(200000)

        it('should send transaction for minting and trigger Transfer event with sendParams(from, gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const originalSupply = await token.totalSupply()

            const mintingAmount = 10000
            const customGasLimit = '0x30d40'
            const minted = await token.mint(testAccount.address, mintingAmount, { from: sender.address, gas: customGasLimit })
            expect(minted.gas).to.equals(customGasLimit)
            expect(minted.from).to.be.equals(sender.address.toLowerCase())
            expect(minted.status).to.be.true
            expect(minted.events).not.to.be.undefined
            expect(minted.events.Transfer).not.to.be.undefined
            expect(minted.events.Transfer.address).to.equals(fullAddress)

            const afterSupply = await token.totalSupply()

            expect(Number(afterSupply) - Number(originalSupply)).to.equals(mintingAmount)
        }).timeout(200000)

        it('should send transaction for minting and trigger Transfer event with sendParams(gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const originalSupply = await token.totalSupply()

            // set deafult from address in erc20 instance
            token.options.from = sender.address

            const mintingAmount = 10000
            const customGasLimit = '0x30d40'
            const minted = await token.mint(testAccount.address, mintingAmount, { gas: customGasLimit })
            expect(minted.from).to.be.equals(sender.address.toLowerCase())
            expect(minted.status).to.be.true
            expect(minted.events).not.to.be.undefined
            expect(minted.events.Transfer).not.to.be.undefined
            expect(minted.events.Transfer.address).to.equals(fullAddress)

            const afterSupply = await token.totalSupply()

            expect(Number(afterSupply) - Number(originalSupply)).to.equals(mintingAmount)
        }).timeout(200000)
    })

    context('erc20Full.addMinter', () => {
        it('should send transaction for adding minter and trigger MinterAdded event without sendParams', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const newMinter = caver.klay.accounts.create().address
            expect(await token.isMinter(newMinter)).to.be.false

            // set deafult from address in erc20 instance
            token.options.from = sender.address

            const minterAdded = await token.addMinter(newMinter)
            expect(minterAdded.from).to.be.equals(sender.address.toLowerCase())
            expect(minterAdded.status).to.be.true
            expect(minterAdded.events).not.to.be.undefined
            expect(minterAdded.events.MinterAdded).not.to.be.undefined
            expect(minterAdded.events.MinterAdded.address).to.equals(fullAddress)

            expect(await token.isMinter(newMinter)).to.be.true
        }).timeout(200000)

        it('should send transaction for adding minter and trigger MinterAdded event with sendParams(from)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const newMinter = caver.klay.accounts.create().address
            expect(await token.isMinter(newMinter)).to.be.false

            const minterAdded = await token.addMinter(newMinter, { from: sender.address })
            expect(minterAdded.from).to.be.equals(sender.address.toLowerCase())
            expect(minterAdded.status).to.be.true
            expect(minterAdded.events).not.to.be.undefined
            expect(minterAdded.events.MinterAdded).not.to.be.undefined
            expect(minterAdded.events.MinterAdded.address).to.equals(fullAddress)

            expect(await token.isMinter(newMinter)).to.be.true
        }).timeout(200000)

        it('should send transaction for adding minter and trigger MinterAdded event with sendParams(from, gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const newMinter = caver.klay.accounts.create().address
            expect(await token.isMinter(newMinter)).to.be.false

            const customGasLimit = '0x30d40'
            const minterAdded = await token.addMinter(newMinter, { from: sender.address, gas: customGasLimit })
            expect(minterAdded.gas).to.equals(customGasLimit)
            expect(minterAdded.from).to.be.equals(sender.address.toLowerCase())
            expect(minterAdded.status).to.be.true
            expect(minterAdded.events).not.to.be.undefined
            expect(minterAdded.events.MinterAdded).not.to.be.undefined
            expect(minterAdded.events.MinterAdded.address).to.equals(fullAddress)

            expect(await token.isMinter(newMinter)).to.be.true
        }).timeout(200000)

        it('should send transaction for adding minter and trigger MinterAdded event with sendParams(gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const newMinter = caver.klay.accounts.create().address
            expect(await token.isMinter(newMinter)).to.be.false

            // set deafult from address in erc20 instance
            token.options.from = sender.address

            const customGasLimit = '0x30d40'
            const minterAdded = await token.addMinter(newMinter, { gas: customGasLimit })
            expect(minterAdded.from).to.be.equals(sender.address.toLowerCase())
            expect(minterAdded.status).to.be.true
            expect(minterAdded.events).not.to.be.undefined
            expect(minterAdded.events.MinterAdded).not.to.be.undefined
            expect(minterAdded.events.MinterAdded.address).to.equals(fullAddress)

            expect(await token.isMinter(newMinter)).to.be.true
        }).timeout(200000)
    })

    context('erc20Full.renounceMinter', () => {
        it('should send transaction for removing minter and trigger MinterRemoved event without sendParams', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            await token.addMinter(testAccount.address, { from: sender.address })
            expect(await token.isMinter(testAccount.address)).to.be.true

            // set deafult from address in erc20 instance
            token.options.from = testAccount.address

            const minterRemoved = await token.renounceMinter()
            expect(minterRemoved.from).to.be.equals(testAccount.address.toLowerCase())
            expect(minterRemoved.status).to.be.true
            expect(minterRemoved.events).not.to.be.undefined
            expect(minterRemoved.events.MinterRemoved).not.to.be.undefined
            expect(minterRemoved.events.MinterRemoved.address).to.equals(fullAddress)

            expect(await token.isMinter(testAccount.address)).to.be.false
        }).timeout(200000)

        it('should send transaction for removing minter and trigger MinterRemoved event with sendParams(from)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            await token.addMinter(testAccount.address, { from: sender.address })
            expect(await token.isMinter(testAccount.address)).to.be.true

            const minterRemoved = await token.renounceMinter({ from: testAccount.address })
            expect(minterRemoved.from).to.be.equals(testAccount.address.toLowerCase())
            expect(minterRemoved.status).to.be.true
            expect(minterRemoved.events).not.to.be.undefined
            expect(minterRemoved.events.MinterRemoved).not.to.be.undefined
            expect(minterRemoved.events.MinterRemoved.address).to.equals(fullAddress)

            expect(await token.isMinter(testAccount.address)).to.be.false
        }).timeout(200000)

        it('should send transaction for removing minter and trigger MinterRemoved event with sendParams(from, gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            await token.addMinter(testAccount.address, { from: sender.address })
            expect(await token.isMinter(testAccount.address)).to.be.true

            const customGasLimit = '0x30d40'
            const minterRemoved = await token.renounceMinter({ from: testAccount.address, gas: customGasLimit })
            expect(minterRemoved.gas).to.equals(customGasLimit)
            expect(minterRemoved.from).to.be.equals(testAccount.address.toLowerCase())
            expect(minterRemoved.status).to.be.true
            expect(minterRemoved.events).not.to.be.undefined
            expect(minterRemoved.events.MinterRemoved).not.to.be.undefined
            expect(minterRemoved.events.MinterRemoved.address).to.equals(fullAddress)

            expect(await token.isMinter(testAccount.address)).to.be.false
        }).timeout(200000)

        it('should send transaction for removing minter and trigger MinterRemoved event with sendParams(gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            await token.addMinter(testAccount.address, { from: sender.address })
            expect(await token.isMinter(testAccount.address)).to.be.true

            // set deafult from address in erc20 instance
            token.options.from = testAccount.address

            const customGasLimit = '0x30d40'
            const minterRemoved = await token.renounceMinter({ gas: customGasLimit })
            expect(minterRemoved.from).to.be.equals(testAccount.address.toLowerCase())
            expect(minterRemoved.status).to.be.true
            expect(minterRemoved.events).not.to.be.undefined
            expect(minterRemoved.events.MinterRemoved).not.to.be.undefined
            expect(minterRemoved.events.MinterRemoved.address).to.equals(fullAddress)

            expect(await token.isMinter(testAccount.address)).to.be.false
        }).timeout(200000)
    })

    context('erc20Full.burn', () => {
        it('should send transaction for burning and trigger Transfer event without sendParams', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const originalSupply = await token.totalSupply()

            // set deafult from address in erc20 instance
            token.options.from = sender.address

            const burningAmount = 1000
            const burned = await token.burn(burningAmount)
            expect(burned.from).to.be.equals(sender.address.toLowerCase())
            expect(burned.status).to.be.true
            expect(burned.events).not.to.be.undefined
            expect(burned.events.Transfer).not.to.be.undefined
            expect(burned.events.Transfer.address).to.equals(fullAddress)

            const afterSupply = await token.totalSupply()
            expect(Number(originalSupply) - Number(afterSupply)).to.be.equals(burningAmount)
        }).timeout(200000)

        it('should send transaction for burning and trigger Transfer event with sendParams(from)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const originalSupply = await token.totalSupply()

            const burningAmount = 1000
            const burned = await token.burn(burningAmount, { from: sender.address })
            expect(burned.from).to.be.equals(sender.address.toLowerCase())
            expect(burned.status).to.be.true
            expect(burned.events).not.to.be.undefined
            expect(burned.events.Transfer).not.to.be.undefined
            expect(burned.events.Transfer.address).to.equals(fullAddress)

            const afterSupply = await token.totalSupply()
            expect(Number(originalSupply) - Number(afterSupply)).to.be.equals(burningAmount)
        }).timeout(200000)

        it('should send transaction for burning and trigger Transfer event with sendParams(from, gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const originalSupply = await token.totalSupply()

            const burningAmount = 1000
            const customGasLimit = '0x30d40'
            const burned = await token.burn(burningAmount, { from: sender.address, gas: customGasLimit })
            expect(burned.gas).to.equals(customGasLimit)
            expect(burned.from).to.be.equals(sender.address.toLowerCase())
            expect(burned.status).to.be.true
            expect(burned.events).not.to.be.undefined
            expect(burned.events.Transfer).not.to.be.undefined
            expect(burned.events.Transfer.address).to.equals(fullAddress)

            const afterSupply = await token.totalSupply()
            expect(Number(originalSupply) - Number(afterSupply)).to.be.equals(burningAmount)
        }).timeout(200000)

        it('should send transaction for burning and trigger Transfer event with sendParams(gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const originalSupply = await token.totalSupply()

            // set deafult from address in erc20 instance
            token.options.from = sender.address

            const burningAmount = 1000
            const customGasLimit = '0x30d40'
            const burned = await token.burn(burningAmount, { gas: customGasLimit })
            expect(burned.from).to.be.equals(sender.address.toLowerCase())
            expect(burned.status).to.be.true
            expect(burned.events).not.to.be.undefined
            expect(burned.events.Transfer).not.to.be.undefined
            expect(burned.events.Transfer.address).to.equals(fullAddress)

            const afterSupply = await token.totalSupply()
            expect(Number(originalSupply) - Number(afterSupply)).to.be.equals(burningAmount)
        }).timeout(200000)
    })

    context('erc20Full.burnFrom', () => {
        it('should send transaction for burning token and trigger Transfer event without sendParams', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const originalSupply = await token.totalSupply()

            const burningAmount = 10000
            await token.approve(testAccount.address, burningAmount, { from: sender.address })
            const originalAllowance = await token.allowance(sender.address, testAccount.address)
            expect(Number(originalAllowance)).to.be.equals(burningAmount)

            // set deafult from address in erc20 instance
            token.options.from = testAccount.address

            const transfered = await token.burnFrom(sender.address, burningAmount)
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(fullAddress)

            expect(await token.allowance(sender.address, testAccount.address)).to.be.equals('0')
            const afterSupply = await token.totalSupply()
            expect(Number(originalSupply) - Number(afterSupply)).to.be.equals(burningAmount)
        }).timeout(200000)

        it('should send transaction for burning token and trigger Transfer event with sendParams(from)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const originalSupply = await token.totalSupply()

            const burningAmount = 10000
            await token.approve(testAccount.address, burningAmount, { from: sender.address })
            const originalAllowance = await token.allowance(sender.address, testAccount.address)
            expect(Number(originalAllowance)).to.be.equals(burningAmount)

            // set deafult from address in erc20 instance
            token.options.from = testAccount.address

            const transfered = await token.burnFrom(sender.address, burningAmount, { from: testAccount.address })
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(fullAddress)

            expect(await token.allowance(sender.address, testAccount.address)).to.be.equals('0')
            const afterSupply = await token.totalSupply()
            expect(Number(originalSupply) - Number(afterSupply)).to.be.equals(burningAmount)
        }).timeout(200000)

        it('should send transaction for burning token and trigger Transfer event with sendParams(from, gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const originalSupply = await token.totalSupply()

            const burningAmount = 10000
            await token.approve(testAccount.address, burningAmount, { from: sender.address })
            const originalAllowance = await token.allowance(sender.address, testAccount.address)
            expect(Number(originalAllowance)).to.be.equals(burningAmount)

            const customGasLimit = '0x186a0'
            const transfered = await token.burnFrom(sender.address, burningAmount, {
                from: testAccount.address,
                gas: customGasLimit,
            })
            expect(transfered.gas).to.equals(customGasLimit)
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(fullAddress)

            expect(await token.allowance(sender.address, testAccount.address)).to.be.equals('0')
            const afterSupply = await token.totalSupply()
            expect(Number(originalSupply) - Number(afterSupply)).to.be.equals(burningAmount)
        }).timeout(200000)

        it('should send transaction for burning token and trigger Transfer event with sendParams(gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const originalSupply = await token.totalSupply()

            const burningAmount = 10000
            await token.approve(testAccount.address, burningAmount, { from: sender.address })
            const originalAllowance = await token.allowance(sender.address, testAccount.address)
            expect(Number(originalAllowance)).to.be.equals(burningAmount)

            // set deafult from address in erc20 instance
            token.options.from = testAccount.address

            const customGasLimit = '0x186a0'
            const transfered = await token.burnFrom(sender.address, burningAmount, { gas: customGasLimit })
            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.gas).to.equals(customGasLimit)
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.Transfer).not.to.be.undefined
            expect(transfered.events.Transfer.address).to.equals(fullAddress)

            expect(await token.allowance(sender.address, testAccount.address)).to.be.equals('0')
            const afterSupply = await token.totalSupply()
            expect(Number(originalSupply) - Number(afterSupply)).to.be.equals(burningAmount)
        }).timeout(200000)
    })

    context('erc20Full.addPauser', () => {
        it('should send transaction for adding pauser and trigger PauserAdded event without sendParams', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const newPauser = caver.klay.accounts.create().address
            expect(await token.isPauser(newPauser)).to.be.false

            // set deafult from address in erc20 instance
            token.options.from = sender.address

            const pauserAdded = await token.addPauser(newPauser)
            expect(pauserAdded.from).to.be.equals(sender.address.toLowerCase())
            expect(pauserAdded.status).to.be.true
            expect(pauserAdded.events).not.to.be.undefined
            expect(pauserAdded.events.PauserAdded).not.to.be.undefined
            expect(pauserAdded.events.PauserAdded.address).to.equals(fullAddress)

            expect(await token.isPauser(newPauser)).to.be.true
        }).timeout(200000)

        it('should send transaction for adding pauser and trigger PauserAdded event with sendParams(from)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const newPauser = caver.klay.accounts.create().address
            expect(await token.isPauser(newPauser)).to.be.false

            const pauserAdded = await token.addPauser(newPauser, { from: sender.address })
            expect(pauserAdded.from).to.be.equals(sender.address.toLowerCase())
            expect(pauserAdded.status).to.be.true
            expect(pauserAdded.events).not.to.be.undefined
            expect(pauserAdded.events.PauserAdded).not.to.be.undefined
            expect(pauserAdded.events.PauserAdded.address).to.equals(fullAddress)

            expect(await token.isPauser(newPauser)).to.be.true
        }).timeout(200000)

        it('should send transaction for adding pauser and trigger PauserAdded event with sendParams(from, gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const newPauser = caver.klay.accounts.create().address
            expect(await token.isPauser(newPauser)).to.be.false

            const customGasLimit = '0x30d40'
            const pauserAdded = await token.addPauser(newPauser, { from: sender.address, gas: customGasLimit })
            expect(pauserAdded.gas).to.equals(customGasLimit)
            expect(pauserAdded.from).to.be.equals(sender.address.toLowerCase())
            expect(pauserAdded.status).to.be.true
            expect(pauserAdded.events).not.to.be.undefined
            expect(pauserAdded.events.PauserAdded).not.to.be.undefined
            expect(pauserAdded.events.PauserAdded.address).to.equals(fullAddress)

            expect(await token.isPauser(newPauser)).to.be.true
        }).timeout(200000)

        it('should send transaction for adding pauser and trigger PauserAdded event with sendParams(gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const newPauser = caver.klay.accounts.create().address
            expect(await token.isPauser(newPauser)).to.be.false

            // set deafult from address in erc20 instance
            token.options.from = sender.address

            const customGasLimit = '0x30d40'
            const pauserAdded = await token.addPauser(newPauser, { gas: customGasLimit })
            expect(pauserAdded.from).to.be.equals(sender.address.toLowerCase())
            expect(pauserAdded.status).to.be.true
            expect(pauserAdded.events).not.to.be.undefined
            expect(pauserAdded.events.PauserAdded).not.to.be.undefined
            expect(pauserAdded.events.PauserAdded.address).to.equals(fullAddress)

            expect(await token.isPauser(newPauser)).to.be.true
        }).timeout(200000)
    })

    context('erc20Full.pause', () => {
        it('should send transaction for pausing without sendParams', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            // set deafult from address in erc20 instance
            token.options.from = sender.address

            const doPause = await token.pause()
            expect(doPause.from).to.be.equals(sender.address.toLowerCase())
            expect(doPause.status).to.be.true

            expect(await token.paused()).to.be.true

            await token.unpause({ from: sender.address })
        }).timeout(200000)

        it('should send transaction for pausing with sendParams(from)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const doPause = await token.pause({ from: sender.address })
            expect(doPause.from).to.be.equals(sender.address.toLowerCase())
            expect(doPause.status).to.be.true

            expect(await token.paused()).to.be.true

            await token.unpause({ from: sender.address })
        }).timeout(200000)

        it('should send transaction for pausing with sendParams(from, gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            const customGasLimit = '0x30d40'
            const doPause = await token.pause({ from: sender.address, gas: customGasLimit })
            expect(doPause.gas).to.equals(customGasLimit)
            expect(doPause.from).to.be.equals(sender.address.toLowerCase())
            expect(doPause.status).to.be.true

            expect(await token.paused()).to.be.true

            await token.unpause({ from: sender.address })
        }).timeout(200000)

        it('should send transaction for pausing with sendParams(gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            // set deafult from address in erc20 instance
            token.options.from = sender.address

            const customGasLimit = '0x30d40'
            const doPause = await token.pause({ gas: customGasLimit })
            expect(doPause.from).to.be.equals(sender.address.toLowerCase())
            expect(doPause.status).to.be.true

            expect(await token.paused()).to.be.true

            await token.unpause({ from: sender.address })
        }).timeout(200000)
    })

    context('erc20Full.unpause', () => {
        it('should send transaction for unpausing without sendParams', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            await token.pause({ from: sender.address })

            // set deafult from address in erc20 instance
            token.options.from = sender.address

            const doPause = await token.unpause()
            expect(doPause.from).to.be.equals(sender.address.toLowerCase())
            expect(doPause.status).to.be.true

            expect(await token.paused()).to.be.false
        }).timeout(200000)

        it('should send transaction for unpausing with sendParams(from)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            await token.pause({ from: sender.address })

            const doPause = await token.unpause({ from: sender.address })
            expect(doPause.from).to.be.equals(sender.address.toLowerCase())
            expect(doPause.status).to.be.true

            expect(await token.paused()).to.be.false
        }).timeout(200000)

        it('should send transaction for unpausing with sendParams(from, gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            await token.pause({ from: sender.address })

            const customGasLimit = '0x30d40'
            const doPause = await token.unpause({ from: sender.address, gas: customGasLimit })
            expect(doPause.gas).to.equals(customGasLimit)
            expect(doPause.from).to.be.equals(sender.address.toLowerCase())
            expect(doPause.status).to.be.true

            expect(await token.paused()).to.be.false
        }).timeout(200000)

        it('should send transaction for unpausing with sendParams(gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            await token.pause({ from: sender.address })

            // set deafult from address in erc20 instance
            token.options.from = sender.address

            const customGasLimit = '0x30d40'
            const doPause = await token.unpause({ gas: customGasLimit })
            expect(doPause.from).to.be.equals(sender.address.toLowerCase())
            expect(doPause.status).to.be.true

            expect(await token.paused()).to.be.false
        }).timeout(200000)
    })

    context('erc20Full.renouncePauser', () => {
        it('should send transaction for removing pauser and trigger PauserRemoved event without sendParams', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            await token.addPauser(testAccount.address, { from: sender.address })
            expect(await token.isPauser(testAccount.address)).to.be.true

            // set deafult from address in erc20 instance
            token.options.from = testAccount.address

            const pauserRemoved = await token.renouncePauser()
            expect(pauserRemoved.from).to.be.equals(testAccount.address.toLowerCase())
            expect(pauserRemoved.status).to.be.true
            expect(pauserRemoved.events).not.to.be.undefined
            expect(pauserRemoved.events.PauserRemoved).not.to.be.undefined
            expect(pauserRemoved.events.PauserRemoved.address).to.equals(fullAddress)

            expect(await token.isPauser(testAccount.address)).to.be.false
        }).timeout(200000)

        it('should send transaction for removing pauser and trigger PauserRemoved event with sendParams(from)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            await token.addPauser(testAccount.address, { from: sender.address })
            expect(await token.isPauser(testAccount.address)).to.be.true

            const pauserRemoved = await token.renouncePauser({ from: testAccount.address })
            expect(pauserRemoved.from).to.be.equals(testAccount.address.toLowerCase())
            expect(pauserRemoved.status).to.be.true
            expect(pauserRemoved.events).not.to.be.undefined
            expect(pauserRemoved.events.PauserRemoved).not.to.be.undefined
            expect(pauserRemoved.events.PauserRemoved.address).to.equals(fullAddress)

            expect(await token.isPauser(testAccount.address)).to.be.false
        }).timeout(200000)

        it('should send transaction for removing pauser and trigger PauserRemoved event with sendParams(from, gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            await token.addPauser(testAccount.address, { from: sender.address })
            expect(await token.isPauser(testAccount.address)).to.be.true

            const customGasLimit = '0x30d40'
            const pauserRemoved = await token.renouncePauser({ from: testAccount.address, gas: customGasLimit })
            expect(pauserRemoved.gas).to.equals(customGasLimit)
            expect(pauserRemoved.from).to.be.equals(testAccount.address.toLowerCase())
            expect(pauserRemoved.status).to.be.true
            expect(pauserRemoved.events).not.to.be.undefined
            expect(pauserRemoved.events.PauserRemoved).not.to.be.undefined
            expect(pauserRemoved.events.PauserRemoved.address).to.equals(fullAddress)

            expect(await token.isPauser(testAccount.address)).to.be.false
        }).timeout(200000)

        it('should send transaction for removing pauser and trigger PauserRemoved event with sendParams(gas)', async () => {
            const token = await caver.klay.ERC20.create(fullAddress)

            await token.addPauser(testAccount.address, { from: sender.address })
            expect(await token.isPauser(testAccount.address)).to.be.true

            // set deafult from address in erc20 instance
            token.options.from = testAccount.address

            const customGasLimit = '0x30d40'
            const pauserRemoved = await token.renouncePauser({ gas: customGasLimit })
            expect(pauserRemoved.from).to.be.equals(testAccount.address.toLowerCase())
            expect(pauserRemoved.status).to.be.true
            expect(pauserRemoved.events).not.to.be.undefined
            expect(pauserRemoved.events.PauserRemoved).not.to.be.undefined
            expect(pauserRemoved.events.PauserRemoved.address).to.equals(fullAddress)

            expect(await token.isPauser(testAccount.address)).to.be.false
        }).timeout(200000)
    })
})
