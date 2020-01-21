const Caver = require('./index')

const caver = new Caver('http://13.125.237.78:8551/')

const cn = caver.klay.accounts.wallet.add('06dc654cbce146804b31ea68a9c9988c9bf333027a115aecef02174ca18c935a')
const cn2 = caver.klay.accounts.wallet.add('ad2ac18efa9e8cd6424855b5406db4d9323c06f8e113f3cf9d80568e2022ab09')
const testAccount = caver.klay.accounts.wallet.add('0x25460e9158770c449c27f6fc056a10a7d73227d913f9837be5e0fe0b6760dd40')

// test()
async function test() {
    const erc20 = new caver.klay.ERC20()

    const tokenInfo = {
        name: 'Jasmine',
        symbol: 'JAS',
        decimal: 18,
        initialSupply: 1000000000000000,
    }

    const deployed = await erc20.deploy(tokenInfo, cn.address)

    const name = await deployed.name()
    const symbol = await deployed.symbol()
    const decimals = await deployed.decimals()
    console.log(`tokenName : ${name} / symbol: ${symbol} / decimal: ${decimals}`)

    const balance = await deployed.balanceOf(cn.address)
    console.log(`${cn.address}'s JAS token balance : ${balance}`)

    const approved = await deployed.approve(cn.address, cn2.address, 10000)
    console.log(approved)

    const allowance = await deployed.allowance(cn.address, cn2.address)
    console.log(`allowance: ${allowance}`)

    const transfered = await deployed.transferFrom(cn2.address, cn.address, testAccount.address, 1000)
    console.log(transfered)

    const afterallowance = await deployed.allowance(cn.address, cn2.address)
    console.log(`allowance: ${afterallowance}`)

    const afterTransferBalance = await deployed.balanceOf(cn.address)
    console.log(`${cn.address}'s JAS token balance : ${afterTransferBalance}`)
}

// testMintable()
async function testMintable() {
    const erc20 = new caver.klay.ERC20()

    const tokenInfo = {
        name: 'Jasmine',
        symbol: 'JAS',
        decimal: 18,
        initialSupply: 1000000000000000,
    }

    const deployed = await erc20.deployMintable(tokenInfo, cn.address)

    const name = await deployed.name()
    const symbol = await deployed.symbol()
    const decimals = await deployed.decimals()
    console.log(`tokenName : ${name} / symbol: ${symbol} / decimal: ${decimals}`)

    const totalSupply = await deployed.totalSupply()
    console.log(`Original Total supply : ${totalSupply}`)

    const minting = await deployed.mint(cn.address, 1000000000000000)
    console.log(minting)

    const added = await deployed.addMinter(cn.address, cn2.address)
    console.log(added)

    const isMinter = await deployed.isMinter(cn2.address)
    console.log(`${cn2.address} is minter?? ${isMinter}`)

    const removed = await deployed.renounceMinter(cn2.address)
    console.log(removed)

    const isMinter2 = await deployed.isMinter(cn2.address)
    console.log(`${cn2.address} is minter?? ${isMinter2}`)

    const afterTotalSupply = await deployed.totalSupply()
    console.log(`After minting Total supply : ${afterTotalSupply}`)

    const balance = await deployed.balanceOf(cn.address)
    console.log(`${cn.address}'s JAS token balance : ${balance}`)

    const approved = await deployed.approve(cn.address, cn2.address, 10000)
    console.log(approved)

    const allowance = await deployed.allowance(cn.address, cn2.address)
    console.log(`allowance: ${allowance}`)

    const transfered = await deployed.transferFrom(cn2.address, cn.address, testAccount.address, 1000)
    console.log(transfered)

    const afterallowance = await deployed.allowance(cn.address, cn2.address)
    console.log(`allowance: ${afterallowance}`)

    const afterTransferBalance = await deployed.balanceOf(cn.address)
    console.log(`${cn.address}'s JAS token balance : ${afterTransferBalance}`)
}

// testBurnable()
async function testBurnable() {
    const erc20 = new caver.klay.ERC20()

    const tokenInfo = {
        name: 'Jasmine',
        symbol: 'JAS',
        decimal: 18,
        initialSupply: 1000000000000000,
    }

    const deployed = await erc20.deployBurnable(tokenInfo, cn.address)

    const name = await deployed.name()
    const symbol = await deployed.symbol()
    const decimals = await deployed.decimals()
    console.log(`tokenName : ${name} / symbol: ${symbol} / decimal: ${decimals}`)

    const totalSupply = await deployed.totalSupply()
    console.log(`Original Total supply : ${totalSupply}`)

    const burning = await deployed.burn(cn.address, 500000000000000)
    console.log(burning)

    const afterTotalSupply = await deployed.totalSupply()
    console.log(`After burning Total supply : ${afterTotalSupply}`)

    // const balance = await deployed.balanceOf(cn.address)
    // console.log(`${cn.address}'s JAS token balance : ${balance}`)

    const approved = await deployed.approve(cn.address, cn2.address, 10000)
    console.log(approved)

    // const allowance = await deployed.allowance(cn.address, cn2.address)
    // console.log(`allowance: ${allowance}`)

    const burnedFrom = await deployed.burnFrom(cn2.address, cn.address, 1000)
    console.log(burnedFrom)
    console.log(`After burning 1000 more Total supply : ${await deployed.totalSupply()}`)

    // const afterallowance = await deployed.allowance(cn.address, cn2.address)
    // console.log(`allowance: ${afterallowance}`)

    // const afterTransferBalance = await deployed.balanceOf(cn.address)
    // console.log(`${cn.address}'s JAS token balance : ${afterTransferBalance}`)
}

// testPausable()
async function testPausable() {
    const erc20 = new caver.klay.ERC20()

    const tokenInfo = {
        name: 'Jasmine',
        symbol: 'JAS',
        decimal: 18,
        initialSupply: 1000000000000000,
    }

    const deployed = await erc20.deployPausable(tokenInfo, cn.address)

    const name = await deployed.name()
    const symbol = await deployed.symbol()
    const decimals = await deployed.decimals()
    console.log(`tokenName : ${name} / symbol: ${symbol} / decimal: ${decimals}`)

    const totalSupply = await deployed.totalSupply()
    console.log(`Total supply : ${totalSupply}`)

    const paused = await deployed.pause(cn.address)
    console.log(paused)

    const unpaused = await deployed.unpause(cn.address)
    console.log(unpaused)

    const transfered = await deployed.transfer(cn.address, testAccount.address, 1000)
    console.log(transfered)

    const added = await deployed.addPauser(cn.address, cn2.address)
    console.log(added)

    const isPauser = await deployed.isPauser(cn2.address)
    console.log(`${cn2.address} is pauser?? ${isPauser}`)

    const removed = await deployed.renouncePauser(cn2.address)
    console.log(removed)

    const isPauser2 = await deployed.isPauser(cn2.address)
    console.log(`${cn2.address} is pauser?? ${isPauser2}`)
}

testCapped()
async function testCapped() {
    const erc20 = new caver.klay.ERC20()

    const tokenInfo = {
        name: 'Jasmine',
        symbol: 'JAS',
        decimal: 18,
        initialSupply: 1000000000000000,
    }

    const deployed = await erc20.deployCapped(tokenInfo, cn.address, 2000000000000000)

    const name = await deployed.name()
    const symbol = await deployed.symbol()
    const decimals = await deployed.decimals()
    console.log(`tokenName : ${name} / symbol: ${symbol} / decimal: ${decimals}`)

    const totalSupply = await deployed.totalSupply()
    console.log(`Total supply : ${totalSupply}`)

    const transfered = await deployed.transfer(cn.address, testAccount.address, 1000)
    console.log(transfered)

    const cap = await deployed.cap()
    console.log(`cap : ${cap}`)

    const minting = await deployed.mint(cn.address, 600000000000000)
    console.log(minting)

    console.log(`After minting Total supply : ${await deployed.totalSupply()}`)

    const minting2 = await deployed.mint(cn.address, 600000000000000)
    console.log(minting2)
}
