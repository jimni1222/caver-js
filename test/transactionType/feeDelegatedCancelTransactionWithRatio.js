/*
    Copyright 2018 The caver-js Authors
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

require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')
const assert = require('assert')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

let caver
var senderPrvKey
var senderAddress
var testAccount

before(() => {
  caver = new Caver(testRPCURL)
  senderPrvKey = process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
      ? '0x' + process.env.privateKey
      : process.env.privateKey

  caver.klay.accounts.wallet.add(senderPrvKey)

  const sender = caver.klay.accounts.privateKeyToAccount(senderPrvKey)
  senderAddress = sender.address

  testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
})

describe('FEE_DELEGATED_CANCEL_WITH_RATIO transaction', () => {
  var cancelObject

  beforeEach(() => {
    cancelObject = {
      type: 'FEE_DELEGATED_CANCEL_WITH_RATIO',
      from: senderAddress,
      gas: 900000,
      feeRatio: 20,
    }
  })

  // Error from missing
  it('CAVERJS-UNIT-TX-542 : If transaction object missing from, signTransaction should throw error', async() => {
    const tx = Object.assign({}, cancelObject)
    delete tx.from

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"from" is missing'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-542 : If transaction object missing from, sendTransaction should throw error', () => {
    const tx = Object.assign({}, cancelObject)
    delete tx.from

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The send transactions "from" field must be defined!')
  }).timeout(200000)

  // UnnecessaryTo
  it('CAVERJS-UNIT-TX-543 : If transaction object has unnecessary to field, signTransaction should throw error', async() => {
    const tx = Object.assign({to : testAccount.address}, cancelObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"to" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-543 : If transaction object has unnecessary to field, sendTransaction should throw error', () => {
    const tx = Object.assign({to : testAccount.address}, cancelObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"to" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction')
  }).timeout(200000)

  // UnnecessaryValue
  it('CAVERJS-UNIT-TX-544 : If transaction object has unnecessary value field, signTransaction should throw error', async() => {
    const tx = Object.assign({value : 1}, cancelObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"value" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-544 : If transaction object has unnecessary value field, sendTransaction should throw error', () => {
    const tx = Object.assign({value : 1}, cancelObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"value" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction')
  }).timeout(200000)

  // MissingGas
  it('CAVERJS-UNIT-TX-545 : If transaction object missing gas and gasLimit, signTransaction should throw error', async() => {
    const tx = Object.assign({}, cancelObject)
    delete tx.gas

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"gas" is missing'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-545 : If transaction object missing gas and gasLimit, sendTransaction should throw error', () => {
    const tx = Object.assign({}, cancelObject)
    delete tx.gas

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"gas" is missing')
  }).timeout(200000)

  // UnnecessaryData
  it('CAVERJS-UNIT-TX-546 : If transaction object has unnecessary data field, signTransaction should throw error', async() => {
    const tx = Object.assign({data : '0x68656c6c6f'}, cancelObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"data" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-546 : If transaction object has unnecessary data field, sendTransaction should throw error', () => {
    const tx = Object.assign({data : '0x68656c6c6f'}, cancelObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"data" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction')
  }).timeout(200000)

  // MissingFeePayer
  it('CAVERJS-UNIT-TX-547 : If transaction object missing feePayer, should throw error', async() => {
    const tx = Object.assign({}, cancelObject)

    const ret = await caver.klay.accounts.signTransaction(tx, senderPrvKey)
    expect(()=>caver.klay.sendTransaction({senderRawTransaction: ret.rawTransaction})).to.throws('The "feePayer" field must be defined for signing with feePayer!')
  }).timeout(200000)
  
  // MissingSenderRawTransaction
  it('CAVERJS-UNIT-TX-548 : If transaction object missing senderRawTransaction field, should throw error', async() => {
    expect(()=>caver.klay.sendTransaction({feePayer: testAccount.address})).to.throws('The "senderRawTransaction" field must be defined for signing with feePayer!')
  }).timeout(200000)

  // MissingFeeRatio
  it('CAVERJS-UNIT-TX-549 : If transaction object missing feeRatio, signTransaction should throw error', async() => {
    const tx = Object.assign({}, cancelObject)
    delete tx.feeRatio

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"feeRatio" is missing'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-549 : If transaction object missing feeRatio, sendTransaction should throw error', () => {
    const tx = Object.assign({}, cancelObject)
    delete tx.feeRatio

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"feeRatio" is missing')
  }).timeout(200000)

  // UnnecessaryPublicKey
  it('CAVERJS-UNIT-TX-550 : If transaction object has unnecessary publicKey field, signTransaction should throw error', async() => {
    const tx = Object.assign({publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4'}, cancelObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"publicKey" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-550 : If transaction object has unnecessary publicKey field, sendTransaction should throw error', () => {
    const tx = Object.assign({publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4'}, cancelObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"publicKey" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction')
  }).timeout(200000)

  // UnnecessaryMultisig
  it('CAVERJS-UNIT-TX-551 : If transaction object has unnecessary multisig field, signTransaction should throw error', async() => {
    const multisig = {
      threshold: 3,
      keys: [
        { weight: 1, publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4' },
        { weight: 1, publicKey: '0x8244b727f63656f0c6c6923395b67cb293342de66557d26409fb0e6de96d74a58e20479c531ef99b86699969dcf0ff5c9545bf893f1aaeb20de1978b3e6bc89e' },
        { weight: 1, publicKey: '0x3c63118f279933d6530ffb3ca46d2473dec1ed94b9829d290e8aa8ac8b384c9d3d79a4596abbc172d1ac6b97c079f7a6c3a7902471a20a09ab4139858352fb4f' },
        { weight: 1, publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c' },
      ],
    }
    const tx = Object.assign({multisig}, cancelObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"multisig" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-551 : If transaction object has unnecessary multisig field, sendTransaction should throw error', () => {
    const multisig = {
      threshold: 3,
      keys: [
        { weight: 1, publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4' },
        { weight: 1, publicKey: '0x8244b727f63656f0c6c6923395b67cb293342de66557d26409fb0e6de96d74a58e20479c531ef99b86699969dcf0ff5c9545bf893f1aaeb20de1978b3e6bc89e' },
        { weight: 1, publicKey: '0x3c63118f279933d6530ffb3ca46d2473dec1ed94b9829d290e8aa8ac8b384c9d3d79a4596abbc172d1ac6b97c079f7a6c3a7902471a20a09ab4139858352fb4f' },
        { weight: 1, publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c' },
      ],
    }
    const tx = Object.assign({multisig}, cancelObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"multisig" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction')
  }).timeout(200000)

  // UnnecessaryRoleTransactionKey
  it('CAVERJS-UNIT-TX-552 : If transaction object has unnecessary roleTransactionKey field, signTransaction should throw error', async() => {
    const roleTransactionKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleTransactionKey}, cancelObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"roleTransactionKey" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-552 : If transaction object has unnecessary roleTransactionKey field, sendTransaction should throw error', () => {
    const roleTransactionKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleTransactionKey}, cancelObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"roleTransactionKey" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction')
  }).timeout(200000)

  // UnnecessaryRoleAccountUpdateKey
  it('CAVERJS-UNIT-TX-553 : If transaction object has unnecessary roleAccountUpdateKey field, signTransaction should throw error', async() => {
    const roleAccountUpdateKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleAccountUpdateKey}, cancelObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"roleAccountUpdateKey" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-553 : If transaction object has unnecessary roleAccountUpdateKey field, sendTransaction should throw error', () => {
    const roleAccountUpdateKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleAccountUpdateKey}, cancelObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"roleAccountUpdateKey" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction')
  }).timeout(200000)

  // UnnecessaryRoleFeePayerKey
  it('CAVERJS-UNIT-TX-554 : If transaction object has unnecessary roleFeePayerKey field, signTransaction should throw error', async() => {
    const roleFeePayerKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleFeePayerKey}, cancelObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"roleFeePayerKey" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-554 : If transaction object has unnecessary roleFeePayerKey field, sendTransaction should throw error', () => {
    const roleFeePayerKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleFeePayerKey}, cancelObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"roleFeePayerKey" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction')
  }).timeout(200000)

  // UnnecessaryFailKey
  it('CAVERJS-UNIT-TX-555 : If transaction object has unnecessary failKey field, signTransaction should throw error', async() => {
    const tx = Object.assign({failKey: true}, cancelObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"failKey" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-555 : If transaction object has unnecessary failKey field, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true}, cancelObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"failKey" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction')
  }).timeout(200000)

  // UnnecessaryCodeFormat
  it('CAVERJS-UNIT-TX-556 : If transaction object has unnecessary codeFormat field, signTransaction should throw error', async() => {
    const tx = Object.assign({codeFormat: 'EVM'}, cancelObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"codeFormat" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-556 : If transaction object has unnecessary codeFormat field, sendTransaction should throw error', () => {
    const tx = Object.assign({codeFormat: 'EVM'}, cancelObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"codeFormat" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction')
  }).timeout(200000)

  // UnnecessaryLegacyKey
  it('CAVERJS-UNIT-TX-557 : If transaction object has unnecessary legacyKey field, signTransaction should throw error', async() => {
    const tx = Object.assign({legacyKey: true}, cancelObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"legacyKey" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-557 : If transaction object has unnecessary legacyKey field, sendTransaction should throw error', () => {
    const tx = Object.assign({legacyKey: true}, cancelObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"legacyKey" cannot be used with FEE_DELEGATED_CANCEL_WITH_RATIO transaction')
  }).timeout(200000)
})