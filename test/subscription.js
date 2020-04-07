/*
    Copyright 2019 The caver-js Authors
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

const { expect } = require('chai')
const websocketURL = require('./testWebsocket')

const Caver = require('../index.js')

const caver = new Caver(websocketURL)

let senderPrvKey
let senderAddress
let receiver

// If you are using websocket provider, subscribe the 'newBlockHeaders' event through the subscriptions object after sending the transaction.
// When receiving the 'newBlockHeaders' event, it queries the transaction receipt.
// You can think 'Subscription' object that inherit 'EventEmitter' work well, meaning that receipt comes out as a result after you submit the transaction.
// Here we test the process of sending the transaction and receiving the receipt as the result value to ensure that the 'Subscription' inheriting 'EventEmitter' is working properly.

// Flow
//    [request] klay_sendRawTransaction
// -> [response] transactionHash
// -> [request] klay_getTransactionReceipt
// -> [response] null
// -> Add 'newBlockHeaders' event subscription
// -> [event] new block header event
// -> [request] klay_getTransactionReceipt
// -> [response] receipt

before(() => {
    senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey

    senderAddress = caver.klay.accounts.wallet.add(senderPrvKey).address

    receiver = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
})

describe('get transaction', () => {
    it('CAVERJS-UNIT-ETC-094: getTransaction should return information of transaction.', async () => {
        const testAccount = caver.klay.accounts.create()
        caver.klay.accounts.wallet.add(testAccount)

        const legacy = {
            from: senderAddress,
            to: testAccount.address,
            value: caver.utils.toPeb(10, 'KLAY'),
            gas: 150000,
        }
        const signed = await caver.klay.accounts.signTransaction(legacy)
        await caver.klay.sendSignedTransaction(signed.rawTransaction)

        const nonce = await caver.klay.getTransactionCount(testAccount.address)
        const txObj = {
            from: testAccount.address,
            to: receiver.address,
            value: 1,
            gas: 900000,
            nonce: nonce + 1,
        }
        console.log(`Start testing here!!!!!!!!!!!!!!!!!!!!!!!!!!!!`)
        await caver.klay
            .sendTransaction(txObj)
            .on('transactionHash', t => {
                console.log(`transction hash : ${t}`)
            })
            .on('error', e => {
                console.error(e)
            })
            .on('receipt', r => {
                console.log(`finally receipt`)
                console.log(r)
            })

        // caver.currentProvider.connection.close()
    }).timeout(30000)
})
