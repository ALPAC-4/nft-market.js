# nft-market.js

## Usage
1. build wine.js
```sh
$npm install
$npm run build
```
2. install it on your another project
```sh
$npm install ../nft-market.js
```
../nft-market.js is just example, put the right path
## some samples

```ts
import { LCDClient, MnemonicKey, MsgExecuteContract, MsgInstantiateContract, MsgStoreCode, Wallet } from "@terra-money/terra.js"
import { NftMarket } from "nft-market.js"

const mnemonic = 'seed seed ..'
const contractAddress = 'terra1...'
const nft_address = 'terra1..'
const codeID = 123123

async function sample() {
  const key = new MnemonicKey({mnemonic})
  const lcd = new LCDClient({
    URL: 'https://bombay-lcd.terra.dev',
    chainID: 'bombay-12',
    gasPrices: '0.15uusd',
    gasAdjustment: '1.4'
  })

  const wallet = new Wallet(lcd, key)

  const market = new NftMarket({contractAddress, codeID, lcd, key})


  // sample msg gens
  const instantiateMsg = market.init(key.accAddress, '0.05', 100000, 604800)

  const updateConfig = market.updateConfig({ min_increase: '0.01' })

  const support_assets = [
    { native_token: { denom: 'uusd' } }
  ]
  const royalties = [
    { address: key.accAddress, royalty_rate: '0.05' }
  ]
  const addCollection = market.addCollection(nft_address, support_assets, royalties)

  const support_assets = [
    { native_token: { denom: 'uluna' } },
    { native_token: { denom: 'uusd' } }
  ]
  const royalties = [
    { address: key.accAddress, royalty_rate: '0.1' }
  ]
  const updateCollection = market.updateCollection(nft_address, support_assets, royalties)

  const makeFixedPriceOrder = market.makeFixedPriceOrder(
    nft_address,
    'test_token',
    { info: { native_token: { denom: 'uusd' } },amount: '10000000' }
  )

  const executeOrder = await market.executeOrder(2)

  const makeFixedPriceOrder = market.makeFixedPriceOrder(
    nft_address,
    'test_token',
    { info: { native_token: { denom: 'uusd' } },
    amount: '10000000' }
  )

  const cancelOrder = market.cancelOrder(2)

  const makeAuctionOrder = market.makeAuctionOrder(
    nft_address,
    'test_token',
    { info: { native_token: { denom: 'uusd' } },amount: '10000000' },
    {at_height: 6802062},
    { info: { native_token: { denom: 'uusd' } }, amount: '100000000' }
  )

  const bid = market.bid(1, { info: { native_token: { denom: 'uusd' } }, amount: '11025000' })

  const executeAuction = market.executeAuction(1)



  // execute sample
  wallet.createAndSignTx({ msgs: [executeOrder]})
  .then(tx => lcd.tx.broadcast(tx))
  .then(res => console.log(res.txhash))


  // query sample
  market.ordersQuery({})
  .then(res => console.log(res[0]))

}
```
