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
const { isBigNumber } = require('../../caver-utils')

const KCT_TYPE = {
    FUNGIBLE: 'Fungible',
    NONFUNGIBLE: 'NonFungible',
}

async function determineSendParams(executableObj, sendParam, defaultFrom) {
    let { from, gas } = sendParam
    from = from || defaultFrom
    if (!from) throw new Error(`'from' is missing. Please pass the sender's address via third parameter.`)

    if (gas === undefined) {
        const estimated = await executableObj.estimateGas({ from })
        const originalGas = new BigNumber(estimated, 10)
        const bufferGas = new BigNumber(1.2, 10)

        gas = Math.round(originalGas.times(bufferGas))
    }

    return { from, gas, gasPrice: sendParam.gasPrice, value: sendParam.value }
}

function formatParamForUint256(param) {
    return convertToNumberString(param)
}

function convertToNumberString(value) {
    if (!isBigNumber(value) && !_.isNumber(value) && !_.isString(value)) throw new Error(`unsupported type`)

    const bn = new BigNumber(value)
    const numberString = bn.toString(10)

    if (numberString === 'NaN') throw new Error(`invalid parameter value`)

    return numberString
}

function validateTokenInfoForDeploy(obj, type = KCT_TYPE.FUNGIBLE) {
    const errorFormat = 'Failed to validate token info for deploy: '
    if (!obj.name || !_.isString(obj.name)) throw new Error(`${errorFormat}Invalid name of token`)
    if (!obj.symbol || !_.isString(obj.symbol)) throw new Error(`${errorFormat}Invalid symbol of token`)
    if (type === KCT_TYPE.FUNGIBLE) {
        if (obj.decimals === undefined || !_.isNumber(obj.decimals)) throw new Error(`${errorFormat}Invalid decimals of token`)

        try {
            if (obj.initialSupply === undefined) {
                throw new Error(`Invalid initialSupply of token: ${obj.initialSupply}`)
            } else {
                obj.initialSupply = convertToNumberString(obj.initialSupply)
            }
        } catch (e) {
            // Catch the error here to add more details to the error message.
            throw new Error(`${errorFormat}${e.message}`)
        }
    }
}

// KIP7 token contract source code
// caver-js/packages/caver-klay/caver-klay-kct/contract/token/KIP7/KIP7Token.sol
// The ABI and bytecode below are built via the following command.
// solc --abi --bin --allow-paths . ./packages/caver-klay/caver-klay-kct/contract/token/KIP7/KIP7Token.sol
const kip7JsonInterface = [
    {
        constant: true,
        inputs: [],
        name: 'name',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }],
        name: 'approve',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'totalSupply',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }],
        name: 'transferFrom',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint8' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'unpause', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    {
        constant: false,
        inputs: [{ name: 'account', type: 'address' }, { name: 'amount', type: 'uint256' }],
        name: 'mint',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'amount', type: 'uint256' }],
        name: 'burn',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'isPauser',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'paused',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'renouncePauser', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    {
        constant: true,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'account', type: 'address' }, { name: 'amount', type: 'uint256' }],
        name: 'burnFrom',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'addPauser',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'pause', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    {
        constant: true,
        inputs: [],
        name: 'symbol',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'addMinter',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'renounceMinter', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    {
        constant: false,
        inputs: [{ name: 'to', type: 'address' }, { name: 'value', type: 'uint256' }],
        name: 'transfer',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'isMinter',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
        name: 'allowance',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { name: 'name', type: 'string' },
            { name: 'symbol', type: 'string' },
            { name: 'decimals', type: 'uint8' },
            { name: 'initialSupply', type: 'uint256' },
        ],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    { anonymous: false, inputs: [{ indexed: false, name: 'account', type: 'address' }], name: 'Paused', type: 'event' },
    { anonymous: false, inputs: [{ indexed: false, name: 'account', type: 'address' }], name: 'Unpaused', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, name: 'account', type: 'address' }], name: 'PauserAdded', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, name: 'account', type: 'address' }], name: 'PauserRemoved', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, name: 'account', type: 'address' }], name: 'MinterAdded', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, name: 'account', type: 'address' }], name: 'MinterRemoved', type: 'event' },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'from', type: 'address' },
            { indexed: true, name: 'to', type: 'address' },
            { indexed: false, name: 'value', type: 'uint256' },
        ],
        name: 'Transfer',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'owner', type: 'address' },
            { indexed: true, name: 'spender', type: 'address' },
            { indexed: false, name: 'value', type: 'uint256' },
        ],
        name: 'Approval',
        type: 'event',
    },
]

// KIP7 token contract source code
// caver-js/packages/caver-klay/caver-klay-kct/contract/token/KIP7/KIP7Token.sol
const kip7ByteCode =
    '60806040523480156200001157600080fd5b50604051620026cb380380620026cb833981018060405260808110156200003757600080fd5b8101908080516401000000008111156200005057600080fd5b828101905060208101848111156200006757600080fd5b81518560018202830111640100000000821117156200008557600080fd5b50509291906020018051640100000000811115620000a257600080fd5b82810190506020810184811115620000b957600080fd5b8151856001820283011164010000000082111715620000d757600080fd5b505092919060200180519060200190929190805190602001909291905050508383836200010a33620001a260201b60201c565b6200011b336200020360201b60201c565b6000600560006101000a81548160ff02191690831515021790555082600690805190602001906200014e9291906200067b565b508160079080519060200190620001679291906200067b565b5080600860006101000a81548160ff021916908360ff1602179055505050506200019833826200026460201b60201c565b505050506200072a565b620001bd8160036200042e60201b62001d3b1790919060201c565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b6200021e8160046200042e60201b62001d3b1790919060201c565b8073ffffffffffffffffffffffffffffffffffffffff167f6719d08c1888103bea251a4ed56406bd0c3e69723c8a1686e017e7bbe159b6f860405160405180910390a250565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141562000308576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f4b4950373a206d696e7420746f20746865207a65726f2061646472657373000081525060200191505060405180910390fd5b62000324816002546200051260201b62001bf61790919060201c565b60028190555062000382816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546200051260201b62001bf61790919060201c565b6000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b6200044082826200059b60201b60201c565b15620004b4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b60008082840190508381101562000591576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141562000624576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526022815260200180620026a96022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10620006be57805160ff1916838001178555620006ef565b82800160010185558215620006ef579182015b82811115620006ee578251825591602001919060010190620006d1565b5b509050620006fe919062000702565b5090565b6200072791905b808211156200072357600081600090555060010162000709565b5090565b90565b611f6f806200073a6000396000f3fe608060405234801561001057600080fd5b50600436106101375760003560e01c80636ef8d66d116100b857806395d89b411161007c57806395d89b4114610507578063983b2d561461058a57806398650275146105ce578063a9059cbb146105d8578063aa271e1a1461063e578063dd62ed3e1461069a57610137565b80636ef8d66d1461040957806370a082311461041357806379cc67901461046b57806382dc1ec4146104b95780638456cb59146104fd57610137565b80633f4ba83a116100ff5780633f4ba83a146102ed57806340c10f19146102f757806342966c681461035d57806346fbf68e1461038b5780635c975abb146103e757610137565b806306fdde031461013c578063095ea7b3146101bf57806318160ddd1461022557806323b872dd14610243578063313ce567146102c9575b600080fd5b610144610712565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610184578082015181840152602081019050610169565b50505050905090810190601f1680156101b15780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b61020b600480360360408110156101d557600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506107b4565b604051808215151515815260200191505060405180910390f35b61022d61084b565b6040518082815260200191505060405180910390f35b6102af6004803603606081101561025957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610855565b604051808215151515815260200191505060405180910390f35b6102d16108ee565b604051808260ff1660ff16815260200191505060405180910390f35b6102f5610905565b005b6103436004803603604081101561030d57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610a65565b604051808215151515815260200191505060405180910390f35b6103896004803603602081101561037357600080fd5b8101908080359060200190929190505050610ad9565b005b6103cd600480360360208110156103a157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610ae6565b604051808215151515815260200191505060405180910390f35b6103ef610b03565b604051808215151515815260200191505060405180910390f35b610411610b1a565b005b6104556004803603602081101561042957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610b25565b6040518082815260200191505060405180910390f35b6104b76004803603604081101561048157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610b6d565b005b6104fb600480360360208110156104cf57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610b7b565b005b610505610be5565b005b61050f610d46565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561054f578082015181840152602081019050610534565b50505050905090810190601f16801561057c5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6105cc600480360360208110156105a057600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610de8565b005b6105d6610e52565b005b610624600480360360408110156105ee57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610e5d565b604051808215151515815260200191505060405180910390f35b6106806004803603602081101561065457600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610ef4565b604051808215151515815260200191505060405180910390f35b6106fc600480360360408110156106b057600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610f11565b6040518082815260200191505060405180910390f35b606060068054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156107aa5780601f1061077f576101008083540402835291602001916107aa565b820191906000526020600020905b81548152906001019060200180831161078d57829003601f168201915b5050505050905090565b6000600560009054906101000a900460ff1615610839576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b6108438383610f98565b905092915050565b6000600254905090565b6000600560009054906101000a900460ff16156108da576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b6108e5848484610faf565b90509392505050565b6000600860009054906101000a900460ff16905090565b61090e33610ae6565b610963576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180611e386030913960400191505060405180910390fd5b600560009054906101000a900460ff166109e5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260148152602001807f5061757361626c653a206e6f742070617573656400000000000000000000000081525060200191505060405180910390fd5b6000600560006101000a81548160ff0219169083151502179055507f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa33604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a1565b6000610a7033610ef4565b610ac5576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180611e8a6030913960400191505060405180910390fd5b610acf8383611060565b6001905092915050565b610ae3338261121b565b50565b6000610afc8260046113d690919063ffffffff16565b9050919050565b6000600560009054906101000a900460ff16905090565b610b23336114b4565b565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b610b77828261150e565b5050565b610b8433610ae6565b610bd9576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180611e386030913960400191505060405180910390fd5b610be2816115b5565b50565b610bee33610ae6565b610c43576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180611e386030913960400191505060405180910390fd5b600560009054906101000a900460ff1615610cc6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b6001600560006101000a81548160ff0219169083151502179055507f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a25833604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a1565b606060078054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610dde5780601f10610db357610100808354040283529160200191610dde565b820191906000526020600020905b815481529060010190602001808311610dc157829003601f168201915b5050505050905090565b610df133610ef4565b610e46576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180611e8a6030913960400191505060405180910390fd5b610e4f8161160f565b50565b610e5b33611669565b565b6000600560009054906101000a900460ff1615610ee2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b610eec83836116c3565b905092915050565b6000610f0a8260036113d690919063ffffffff16565b9050919050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b6000610fa53384846116da565b6001905092915050565b6000610fbc8484846118d1565b611055843361105085600160008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054611b6d90919063ffffffff16565b6116da565b600190509392505050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611103576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f4b4950373a206d696e7420746f20746865207a65726f2061646472657373000081525060200191505060405180910390fd5b61111881600254611bf690919063ffffffff16565b60028190555061116f816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054611bf690919063ffffffff16565b6000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156112be576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260208152602001807f4b4950373a206275726e2066726f6d20746865207a65726f206164647265737381525060200191505060405180910390fd5b6112d381600254611b6d90919063ffffffff16565b60028190555061132a816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054611b6d90919063ffffffff16565b6000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141561145d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526022815260200180611eff6022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b6114c8816004611c7e90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167fcd265ebaf09df2871cc7bd4133404a235ba12eff2041bb89d9c714a2621c7c7e60405160405180910390a250565b611518828261121b565b6115b182336115ac84600160008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054611b6d90919063ffffffff16565b6116da565b5050565b6115c9816004611d3b90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167f6719d08c1888103bea251a4ed56406bd0c3e69723c8a1686e017e7bbe159b6f860405160405180910390a250565b611623816003611d3b90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b61167d816003611c7e90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167fe94479a9f7e1952cc78f2d6baab678adc1b772d936c6583def489e524cb6669260405160405180910390a250565b60006116d03384846118d1565b6001905092915050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415611760576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526023815260200180611f216023913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156117e6576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526021815260200180611e176021913960400191505060405180910390fd5b80600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925836040518082815260200191505060405180910390a3505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415611957576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526024815260200180611edb6024913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156119dd576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526022815260200180611e686022913960400191505060405180910390fd5b611a2e816000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054611b6d90919063ffffffff16565b6000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550611ac1816000808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054611bf690919063ffffffff16565b6000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a3505050565b600082821115611be5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f536166654d6174683a207375627472616374696f6e206f766572666c6f77000081525060200191505060405180910390fd5b600082840390508091505092915050565b600080828401905083811015611c74576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b611c8882826113d6565b611cdd576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526021815260200180611eba6021913960400191505060405180910390fd5b60008260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b611d4582826113d6565b15611db8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff021916908315150217905550505056fe4b4950373a20617070726f766520746f20746865207a65726f2061646472657373506175736572526f6c653a2063616c6c657220646f6573206e6f742068617665207468652050617573657220726f6c654b4950373a207472616e7366657220746f20746865207a65726f20616464726573734d696e746572526f6c653a2063616c6c657220646f6573206e6f74206861766520746865204d696e74657220726f6c65526f6c65733a206163636f756e7420646f6573206e6f74206861766520726f6c654b4950373a207472616e736665722066726f6d20746865207a65726f2061646472657373526f6c65733a206163636f756e7420697320746865207a65726f20616464726573734b4950373a20617070726f76652066726f6d20746865207a65726f2061646472657373a165627a7a7230582046cf18507473dba8d9eb81778c6691ebb284e365d9eb55d60cff433de73351040029526f6c65733a206163636f756e7420697320746865207a65726f2061646472657373'

const kip17JsonInterface = [
    {
        constant: true,
        inputs: [{ name: 'interfaceId', type: 'bytes4' }],
        name: 'supportsInterface',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'name',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        name: 'getApproved',
        outputs: [{ name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'to', type: 'address' }, { name: 'tokenId', type: 'uint256' }],
        name: 'approve',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'totalSupply',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'tokenId', type: 'uint256' }],
        name: 'transferFrom',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'owner', type: 'address' }, { name: 'index', type: 'uint256' }],
        name: 'tokenOfOwnerByIndex',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'unpause', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    {
        constant: false,
        inputs: [{ name: 'from', type: 'address' }, { name: 'to', type: 'address' }, { name: 'tokenId', type: 'uint256' }],
        name: 'safeTransferFrom',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        name: 'burn',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'isPauser',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'index', type: 'uint256' }],
        name: 'tokenByIndex',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'to', type: 'address' }, { name: 'tokenId', type: 'uint256' }, { name: 'tokenURI', type: 'string' }],
        name: 'mintWithTokenURI',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'paused',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        name: 'ownerOf',
        outputs: [{ name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'renouncePauser', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    {
        constant: true,
        inputs: [{ name: 'owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'addPauser',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'pause', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    {
        constant: true,
        inputs: [],
        name: 'symbol',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'addMinter',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    { constant: false, inputs: [], name: 'renounceMinter', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function' },
    {
        constant: false,
        inputs: [{ name: 'to', type: 'address' }, { name: 'approved', type: 'bool' }],
        name: 'setApprovalForAll',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'account', type: 'address' }],
        name: 'isMinter',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: false,
        inputs: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'tokenId', type: 'uint256' },
            { name: '_data', type: 'bytes' },
        ],
        name: 'safeTransferFrom',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'tokenId', type: 'uint256' }],
        name: 'tokenURI',
        outputs: [{ name: '', type: 'string' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: 'owner', type: 'address' }, { name: 'operator', type: 'address' }],
        name: 'isApprovedForAll',
        outputs: [{ name: '', type: 'bool' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ name: 'name', type: 'string' }, { name: 'symbol', type: 'string' }],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    { anonymous: false, inputs: [{ indexed: false, name: 'account', type: 'address' }], name: 'Paused', type: 'event' },
    { anonymous: false, inputs: [{ indexed: false, name: 'account', type: 'address' }], name: 'Unpaused', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, name: 'account', type: 'address' }], name: 'PauserAdded', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, name: 'account', type: 'address' }], name: 'PauserRemoved', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, name: 'account', type: 'address' }], name: 'MinterAdded', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, name: 'account', type: 'address' }], name: 'MinterRemoved', type: 'event' },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'from', type: 'address' },
            { indexed: true, name: 'to', type: 'address' },
            { indexed: true, name: 'tokenId', type: 'uint256' },
        ],
        name: 'Transfer',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'owner', type: 'address' },
            { indexed: true, name: 'approved', type: 'address' },
            { indexed: true, name: 'tokenId', type: 'uint256' },
        ],
        name: 'Approval',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'owner', type: 'address' },
            { indexed: true, name: 'operator', type: 'address' },
            { indexed: false, name: 'approved', type: 'bool' },
        ],
        name: 'ApprovalForAll',
        type: 'event',
    },
]

const kip17ByteCode =
    '60806040523480156200001157600080fd5b5060405162003bdb38038062003bdb833981018060405260408110156200003757600080fd5b8101908080516401000000008111156200005057600080fd5b828101905060208101848111156200006757600080fd5b81518560018202830111640100000000821117156200008557600080fd5b50509291906020018051640100000000811115620000a257600080fd5b82810190506020810184811115620000b957600080fd5b8151856001820283011164010000000082111715620000d757600080fd5b505092919050505081818181620000fb6301ffc9a760e01b620001be60201b60201c565b620001136380ac58cd60e01b620001be60201b60201c565b6200012b63780e9d6360e01b620001be60201b60201c565b8160099080519060200190620001439291906200054d565b5080600a90805190602001906200015c9291906200054d565b5062000175635b5e139f60e01b620001be60201b60201c565b505050506200018a33620002c760201b60201c565b6200019b336200032860201b60201c565b6000600e60006101000a81548160ff0219169083151502179055505050620005fc565b63ffffffff60e01b817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614156200025b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601c8152602001807f4552433136353a20696e76616c696420696e746572666163652069640000000081525060200191505060405180910390fd5b6001600080837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b620002e281600c6200038960201b620028201790919060201c565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b6200034381600d6200038960201b620028201790919060201c565b8073ffffffffffffffffffffffffffffffffffffffff167f6719d08c1888103bea251a4ed56406bd0c3e69723c8a1686e017e7bbe159b6f860405160405180910390a250565b6200039b82826200046d60201b60201c565b156200040f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415620004f6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602281526020018062003bb96022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200059057805160ff1916838001178555620005c1565b82800160010185558215620005c1579182015b82811115620005c0578251825591602001919060010190620005a3565b5b509050620005d09190620005d4565b5090565b620005f991905b80821115620005f5576000816000905550600101620005db565b5090565b90565b6135ad806200060c6000396000f3fe608060405234801561001057600080fd5b50600436106101a95760003560e01c80635c975abb116100f9578063983b2d5611610097578063aa271e1a11610071578063aa271e1a146108e2578063b88d4fde1461093e578063c87b56dd14610a43578063e985e9c514610aea576101a9565b8063983b2d56146108445780639865027514610888578063a22cb46514610892576101a9565b806370a08231116100d357806370a082311461071b57806382dc1ec4146107735780638456cb59146107b757806395d89b41146107c1576101a9565b80635c975abb146106815780636352211e146106a35780636ef8d66d14610711576101a9565b80632f745c591161016657806342966c681161014057806342966c68146104b857806346fbf68e146104e65780634f6ccce71461054257806350bb4e7f14610584576101a9565b80632f745c59146103de5780633f4ba83a1461044057806342842e0e1461044a576101a9565b806301ffc9a7146101ae57806306fdde0314610213578063081812fc14610296578063095ea7b31461030457806318160ddd1461035257806323b872dd14610370575b600080fd5b6101f9600480360360208110156101c457600080fd5b8101908080357bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19169060200190929190505050610b66565b604051808215151515815260200191505060405180910390f35b61021b610bcd565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561025b578082015181840152602081019050610240565b50505050905090810190601f1680156102885780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102c2600480360360208110156102ac57600080fd5b8101908080359060200190929190505050610c6f565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6103506004803603604081101561031a57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610d0a565b005b61035a610d9b565b6040518082815260200191505060405180910390f35b6103dc6004803603606081101561038657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610da8565b005b61042a600480360360408110156103f457600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610e3b565b6040518082815260200191505060405180910390f35b610448610efa565b005b6104b66004803603606081101561046057600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019092919050505061105a565b005b6104e4600480360360208110156104ce57600080fd5b810190808035906020019092919050505061107a565b005b610528600480360360208110156104fc57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506110e5565b604051808215151515815260200191505060405180910390f35b61056e6004803603602081101561055857600080fd5b8101908080359060200190929190505050611102565b6040518082815260200191505060405180910390f35b6106676004803603606081101561059a57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156105e157600080fd5b8201836020820111156105f357600080fd5b8035906020019184600183028401116401000000008311171561061557600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050611182565b604051808215151515815260200191505060405180910390f35b610689611201565b604051808215151515815260200191505060405180910390f35b6106cf600480360360208110156106b957600080fd5b8101908080359060200190929190505050611218565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6107196112e0565b005b61075d6004803603602081101561073157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506112eb565b6040518082815260200191505060405180910390f35b6107b56004803603602081101561078957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506113c0565b005b6107bf61142a565b005b6107c961158b565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156108095780820151818401526020810190506107ee565b50505050905090810190601f1680156108365780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6108866004803603602081101561085a57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061162d565b005b610890611697565b005b6108e0600480360360408110156108a857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035151590602001909291905050506116a2565b005b610924600480360360208110156108f857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611733565b604051808215151515815260200191505060405180910390f35b610a416004803603608081101561095457600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156109bb57600080fd5b8201836020820111156109cd57600080fd5b803590602001918460018302840111640100000000831117156109ef57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050611750565b005b610a6f60048036036020811015610a5957600080fd5b81019080803590602001909291905050506117c2565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610aaf578082015181840152602081019050610a94565b50505050905090810190601f168015610adc5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b610b4c60048036036040811015610b0057600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506118d5565b604051808215151515815260200191505060405180910390f35b6000806000837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060009054906101000a900460ff169050919050565b606060098054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610c655780601f10610c3a57610100808354040283529160200191610c65565b820191906000526020600020905b815481529060010190602001808311610c4857829003601f168201915b5050505050905090565b6000610c7a82611969565b610ccf576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602c8152602001806133dd602c913960400191505060405180910390fd5b6002600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b600e60009054906101000a900460ff1615610d8d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b610d9782826119db565b5050565b6000600780549050905090565b600e60009054906101000a900460ff1615610e2b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b610e36838383611bb4565b505050565b6000610e46836112eb565b8210610e9d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602b815260200180613224602b913960400191505060405180910390fd5b600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208281548110610ee757fe5b9060005260206000200154905092915050565b610f03336110e5565b610f58576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806132816030913960400191505060405180910390fd5b600e60009054906101000a900460ff16610fda576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260148152602001807f5061757361626c653a206e6f742070617573656400000000000000000000000081525060200191505060405180910390fd5b6000600e60006101000a81548160ff0219169083151502179055507f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa33604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a1565b61107583838360405180602001604052806000815250611750565b505050565b6110843382611c23565b6110d9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806135526030913960400191505060405180910390fd5b6110e281611d17565b50565b60006110fb82600d611d2c90919063ffffffff16565b9050919050565b600061110c610d9b565b8210611163576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602c815260200180613501602c913960400191505060405180910390fd5b6007828154811061117057fe5b90600052602060002001549050919050565b600061118d33611733565b6111e2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603081526020018061338c6030913960400191505060405180910390fd5b6111ec8484611e0a565b6111f68383611e2b565b600190509392505050565b6000600e60009054906101000a900460ff16905090565b6000806001600084815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156112d7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260298152602001806133636029913960400191505060405180910390fd5b80915050919050565b6112e933611eb5565b565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611372576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602a815260200180613339602a913960400191505060405180910390fd5b6113b9600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020611f0f565b9050919050565b6113c9336110e5565b61141e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806132816030913960400191505060405180910390fd5b61142781611f1d565b50565b611433336110e5565b611488576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806132816030913960400191505060405180910390fd5b600e60009054906101000a900460ff161561150b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b6001600e60006101000a81548160ff0219169083151502179055507f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a25833604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a1565b6060600a8054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156116235780601f106115f857610100808354040283529160200191611623565b820191906000526020600020905b81548152906001019060200180831161160657829003601f168201915b5050505050905090565b61163633611733565b61168b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603081526020018061338c6030913960400191505060405180910390fd5b61169481611f77565b50565b6116a033611fd1565b565b600e60009054906101000a900460ff1615611725576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b61172f828261202b565b5050565b600061174982600c611d2c90919063ffffffff16565b9050919050565b61175b848484610da8565b611767848484846121ce565b6117bc576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603281526020018061324f6032913960400191505060405180910390fd5b50505050565b60606117cd82611969565b611822576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602f815260200180613480602f913960400191505060405180910390fd5b600b60008381526020019081526020016000208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156118c95780601f1061189e576101008083540402835291602001916118c9565b820191906000526020600020905b8154815290600101906020018083116118ac57829003601f168201915b50505050509050919050565b6000600460008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b6000806001600084815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415915050919050565b60006119e682611218565b90508073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415611a6d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260218152602001806134af6021913960400191505060405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161480611aad5750611aac81336118d5565b5b611b02576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260388152602001806133016038913960400191505060405180910390fd5b826002600084815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550818373ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a4505050565b611bbe3382611c23565b611c13576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260318152602001806134d06031913960400191505060405180910390fd5b611c1e8383836123b7565b505050565b6000611c2e82611969565b611c83576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602c8152602001806132d5602c913960400191505060405180910390fd5b6000611c8e83611218565b90508073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161480611cfd57508373ffffffffffffffffffffffffffffffffffffffff16611ce584610c6f565b73ffffffffffffffffffffffffffffffffffffffff16145b80611d0e5750611d0d81856118d5565b5b91505092915050565b611d29611d2382611218565b826123db565b50565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611db3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806134356022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b611e148282612438565b611e1e8282612650565b611e2781612717565b5050565b611e3482611969565b611e89576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602c815260200180613409602c913960400191505060405180910390fd5b80600b60008481526020019081526020016000209080519060200190611eb092919061310a565b505050565b611ec981600d61276390919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167fcd265ebaf09df2871cc7bd4133404a235ba12eff2041bb89d9c714a2621c7c7e60405160405180910390a250565b600081600001549050919050565b611f3181600d61282090919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167f6719d08c1888103bea251a4ed56406bd0c3e69723c8a1686e017e7bbe159b6f860405160405180910390a250565b611f8b81600c61282090919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b611fe581600c61276390919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167fe94479a9f7e1952cc78f2d6baab678adc1b772d936c6583def489e524cb6669260405160405180910390a250565b3373ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156120cd576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260198152602001807f4552433732313a20617070726f766520746f2063616c6c65720000000000000081525060200191505060405180910390fd5b80600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3183604051808215151515815260200191505060405180910390a35050565b60006121ef8473ffffffffffffffffffffffffffffffffffffffff166128fb565b6121fc57600190506123af565b60008473ffffffffffffffffffffffffffffffffffffffff1663150b7a02338887876040518563ffffffff1660e01b8152600401808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b838110156122d75780820151818401526020810190506122bc565b50505050905090810190601f1680156123045780820380516001836020036101000a031916815260200191505b5095505050505050602060405180830381600087803b15801561232657600080fd5b505af115801561233a573d6000803e3d6000fd5b505050506040513d602081101561235057600080fd5b8101908080519060200190929190505050905063150b7a0260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916149150505b949350505050565b6123c283838361290e565b6123cc8382612b69565b6123d68282612650565b505050565b6123e58282612d07565b6000600b60008381526020019081526020016000208054600181600116156101000203166002900490501461243457600b60008281526020019081526020016000206000612433919061318a565b5b5050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156124db576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260208152602001807f4552433732313a206d696e7420746f20746865207a65726f206164647265737381525060200191505060405180910390fd5b6124e481611969565b15612557576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601c8152602001807f4552433732313a20746f6b656e20616c7265616479206d696e7465640000000081525060200191505060405180910390fd5b816001600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506125f0600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020612d41565b808273ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a45050565b600560008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020805490506006600083815260200190815260200160002081905550600560008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190806001815401808255809150509060018203906000526020600020016000909192909190915055505050565b6007805490506008600083815260200190815260200160002081905550600781908060018154018082558091505090600182039060005260206000200160009091929091909150555050565b61276d8282611d2c565b6127c2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260218152602001806133bc6021913960400191505060405180910390fd5b60008260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b61282a8282611d2c565b1561289d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b600080823b905060008111915050919050565b8273ffffffffffffffffffffffffffffffffffffffff1661292e82611218565b73ffffffffffffffffffffffffffffffffffffffff161461299a576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260298152602001806134576029913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415612a20576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001806132b16024913960400191505060405180910390fd5b612a2981612d57565b612a70600360008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020612e15565b612ab7600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020612d41565b816001600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550808273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a4505050565b6000612bc16001600560008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002080549050612e3890919063ffffffff16565b9050600060066000848152602001908152602001600020549050818114612cae576000600560008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208381548110612c2e57fe5b9060005260206000200154905080600560008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208381548110612c8657fe5b9060005260206000200181905550816006600083815260200190815260200160002081905550505b600560008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020805480919060019003612d0091906131d2565b5050505050565b612d118282612ec1565b612d1b8282612b69565b60006006600083815260200190815260200160002081905550612d3d81613050565b5050565b6001816000016000828254019250508190555050565b600073ffffffffffffffffffffffffffffffffffffffff166002600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614612e125760006002600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b50565b612e2d60018260000154612e3890919063ffffffff16565b816000018190555050565b600082821115612eb0576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f536166654d6174683a207375627472616374696f6e206f766572666c6f77000081525060200191505060405180910390fd5b600082840390508091505092915050565b8173ffffffffffffffffffffffffffffffffffffffff16612ee182611218565b73ffffffffffffffffffffffffffffffffffffffff1614612f4d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602581526020018061352d6025913960400191505060405180910390fd5b612f5681612d57565b612f9d600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020612e15565b60006001600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a45050565b600061306b6001600780549050612e3890919063ffffffff16565b905060006008600084815260200190815260200160002054905060006007838154811061309457fe5b9060005260206000200154905080600783815481106130af57fe5b906000526020600020018190555081600860008381526020019081526020016000208190555060078054809190600190036130ea91906131d2565b506000600860008681526020019081526020016000208190555050505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061314b57805160ff1916838001178555613179565b82800160010185558215613179579182015b8281111561317857825182559160200191906001019061315d565b5b50905061318691906131fe565b5090565b50805460018160011615610100020316600290046000825580601f106131b057506131cf565b601f0160209004906000526020600020908101906131ce91906131fe565b5b50565b8154818355818111156131f9578183600052602060002091820191016131f891906131fe565b5b505050565b61322091905b8082111561321c576000816000905550600101613204565b5090565b9056fe455243373231456e756d657261626c653a206f776e657220696e646578206f7574206f6620626f756e64734552433732313a207472616e7366657220746f206e6f6e20455243373231526563656976657220696d706c656d656e746572506175736572526f6c653a2063616c6c657220646f6573206e6f742068617665207468652050617573657220726f6c654552433732313a207472616e7366657220746f20746865207a65726f20616464726573734552433732313a206f70657261746f7220717565727920666f72206e6f6e6578697374656e7420746f6b656e4552433732313a20617070726f76652063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f76656420666f7220616c6c4552433732313a2062616c616e636520717565727920666f7220746865207a65726f20616464726573734552433732313a206f776e657220717565727920666f72206e6f6e6578697374656e7420746f6b656e4d696e746572526f6c653a2063616c6c657220646f6573206e6f74206861766520746865204d696e74657220726f6c65526f6c65733a206163636f756e7420646f6573206e6f74206861766520726f6c654552433732313a20617070726f76656420717565727920666f72206e6f6e6578697374656e7420746f6b656e4552433732314d657461646174613a2055524920736574206f66206e6f6e6578697374656e7420746f6b656e526f6c65733a206163636f756e7420697320746865207a65726f20616464726573734552433732313a207472616e73666572206f6620746f6b656e2074686174206973206e6f74206f776e4552433732314d657461646174613a2055524920717565727920666f72206e6f6e6578697374656e7420746f6b656e4552433732313a20617070726f76616c20746f2063757272656e74206f776e65724552433732313a207472616e736665722063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f766564455243373231456e756d657261626c653a20676c6f62616c20696e646578206f7574206f6620626f756e64734552433732313a206275726e206f6620746f6b656e2074686174206973206e6f74206f776e4552433732314275726e61626c653a2063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f766564a165627a7a723058201ce3e3f811c9d44b08db161ddd91e6d95d827fe0786a7150b66e021e8590b6370029526f6c65733a206163636f756e7420697320746865207a65726f2061646472657373'

module.exports = {
    kip7JsonInterface,
    kip7ByteCode,
    determineSendParams,
    validateTokenInfoForDeploy,
    formatParamForUint256,
    kip17JsonInterface,
    kip17ByteCode,
    KCT_TYPE,
}
