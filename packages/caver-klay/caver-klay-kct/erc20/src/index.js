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
const Contract = require('../../../caver-klay-contract')
const { ERC20_TYPES, ERC20_ABI_CODE } = require('../../kctHelper')
const { isAddress } = require('../../../../caver-utils')
const formatters = require('../../../../caver-core-helpers/src/formatters')
const Method = require('../../../../caver-core-method')

const CODE_HASH = {
    SIMPLE: 'CDq9tSXfwfXczNr64+lGjyJIk+3Soj161pUdTiwEiZw=',
    FULL: 'y8vE5WP/XH2zjic/RoBXTuD0B/MfDil6aNyHXeYbqLc=',
}

class ERC20 extends Contract {
    static deploySimple(tokenInfo, deployer) {
        const erc20 = new ERC20(ERC20_ABI_CODE[ERC20_TYPES.SIMPLE].abi)
        return erc20.deploy(tokenInfo, deployer, ERC20_TYPES.SIMPLE)
    }

    static deploy(tokenInfo, deployer) {
        const erc20 = new ERC20(ERC20_ABI_CODE[ERC20_TYPES.FULL].abi)
        return erc20.deploy(tokenInfo, deployer, ERC20_TYPES.FULL)
    }

    static async create(tokenAddress) {
        const erc20 = new ERC20(ERC20_ABI_CODE[ERC20_TYPES.SIMPLE].abi, tokenAddress)

        const getAccount = new Method({
            name: 'getAccount',
            call: 'klay_getAccount',
            params: 2,
            inputFormatter: [formatters.inputLogFormatter, formatters.inputDefaultBlockNumberFormatter],
            requestManager: erc20._requestManager,
        }).createFunction()

        const result = await getAccount(tokenAddress)

        if (result.accType !== 2) throw new Error(`Invalid token contract address(${tokenAddress})`)
        if (result.account.codeHash !== CODE_HASH.SIMPLE) {
            erc20.options.jsonInterface = ERC20_ABI_CODE[ERC20_TYPES.FULL].abi
            if (result.account.codeHash !== CODE_HASH.FULL) {
                console.warn(`This token contract is not deployed through caver.klay.ERC20 so it may not work properly.`)
            }
        }

        return erc20
    }

    constructor(abi, tokenAddress) {
        if (tokenAddress && !isAddress(tokenAddress)) {
            throw new Error(`Invalid token contract address: The address of token contract is ${tokenAddress}.`)
        }
        super(abi, tokenAddress)
    }

    clone(tokenAddress) {
        return new this.constructor(this.options.jsonInterface, tokenAddress)
    }

    deploy(tokenInfo, deployer, type) {
        if (this.options.address) throw new Error(`The token contract is already deployed at ${this.options.address}.`)

        validateParamObjForDeploy(tokenInfo)

        const { name, symbol, decimal, initialSupply } = tokenInfo
        const gas = 3500000
        const value = 0

        return super
            .deploy({
                data: ERC20_ABI_CODE[type].code,
                arguments: [name, symbol, decimal, initialSupply],
            })
            .send({ from: deployer, gas, value })
    }

    // Below methods for ERC20
    name() {
        return this.methods.name().call()
    }

    symbol() {
        return this.methods.symbol().call()
    }

    decimals() {
        return this.methods.decimals().call()
    }

    totalSupply() {
        return this.methods.totalSupply().call()
    }

    balanceOf(account) {
        return this.methods.balanceOf(account).call()
    }

    allowance(owner, spender) {
        return this.methods.allowance(owner, spender).call()
    }

    approve(msgSender, spender, amount) {
        const gas = 60000
        return this.methods.approve(spender, amount).send({ from: msgSender, gas })
    }

    transfer(msgSender, to, amount) {
        const gas = 60000
        return this.methods.transfer(to, amount).send({ from: msgSender, gas })
    }

    transferFrom(msgSender, from, to, amount) {
        const gas = 70000
        return this.methods.transferFrom(from, to, amount).send({ from: msgSender, gas })
    }

    // Below methods are for ERC20Mintable (extends)
    isMinter(account) {
        if (this.methods.isMinter === undefined) {
            throw new Error(`Token contracts deployed with ERC20Simple do not support 'isMinter'.`)
        }
        return this.methods.isMinter(account).call()
    }

    mint(msgSender, account, amount) {
        if (this.methods.mint === undefined) {
            throw new Error(`Token contracts deployed with ERC20Simple do not support 'mint'.`)
        }
        const gas = 45000
        return this.methods.mint(account, amount).send({ from: msgSender, gas })
    }

    addMinter(msgSender, account) {
        if (this.methods.addMinter === undefined) {
            throw new Error(`Token contracts deployed with ERC20Simple do not support 'addMinter'.`)
        }
        const gas = 50000
        return this.methods.addMinter(account).send({ from: msgSender, gas })
    }

    renounceMinter(minterToRemove) {
        if (this.methods.renounceMinter === undefined) {
            throw new Error(`Token contracts deployed with ERC20Simple do not support 'renounceMinter'.`)
        }
        const gas = 30000
        return this.methods.renounceMinter().send({ from: minterToRemove, gas })
    }

    // Below methods are for ERC20Burnable (extends)
    burn(msgSender, amount) {
        if (this.methods.burn === undefined) {
            throw new Error(`Token contracts deployed with ERC20Simple do not support 'burn'.`)
        }
        const gas = 70000
        return this.methods.burn(amount).send({ from: msgSender, gas })
    }

    burnFrom(msgSender, from, amount) {
        if (this.methods.burnFrom === undefined) {
            throw new Error(`Token contracts deployed with ERC20Simple do not support 'burnFrom'.`)
        }
        const gas = 70000
        return this.methods.burnFrom(from, amount).send({ from: msgSender, gas })
    }

    // Below methods are for ERC20Pausable (extends)
    isPauser(account) {
        if (this.methods.isPauser === undefined) {
            throw new Error(`Token contracts deployed with ERC20Simple do not support 'isPauser'.`)
        }
        return this.methods.isPauser(account).call()
    }

    addPauser(msgSender, account) {
        if (this.methods.addPauser === undefined) {
            throw new Error(`Token contracts deployed with ERC20Simple do not support 'addPauser'.`)
        }
        const gas = 50000
        return this.methods.addPauser(account).send({ from: msgSender, gas })
    }

    pause(msgSender) {
        if (this.methods.pause === undefined) {
            throw new Error(`Token contracts deployed with ERC20Simple do not support 'pause'.`)
        }
        const gas = 45000
        return this.methods.pause().send({ from: msgSender, gas })
    }

    unpause(msgSender) {
        if (this.methods.unpause === undefined) {
            throw new Error(`Token contracts deployed with ERC20Simple do not support 'unpause'.`)
        }
        const gas = 30000
        return this.methods.unpause().send({ from: msgSender, gas })
    }

    renouncePauser(pauserToRemove) {
        if (this.methods.renouncePauser === undefined) {
            throw new Error(`Token contracts deployed with ERC20Simple do not support 'renouncePauser'.`)
        }
        const gas = 30000
        return this.methods.renouncePauser().send({ from: pauserToRemove, gas })
    }
}

function validateParamObjForDeploy(obj) {
    if (!obj.name || !_.isString(obj.name)) throw new Error(`Invalid name of token`)
    if (!obj.symbol || !_.isString(obj.symbol)) throw new Error(`Invalid symbol of token`)
    if (obj.decimal === undefined || !_.isNumber(obj.decimal)) throw new Error(`Invalid decimal of token`)
    if (obj.initialSupply === undefined || !_.isNumber(obj.initialSupply)) throw new Error(`Invalid initialSupply of token`)
}

module.exports = ERC20
