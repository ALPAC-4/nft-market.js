import { Coins, MsgExecuteContract, MsgInstantiateContract } from '@terra-money/terra.js'
import { Contract } from './contract'
import { Asset, AssetInfo, CollectionInfo, Expiration, NativeTokenInfo, NonNativeTokenInfo, Order, Royalty } from '../types'

// query msg and responses
interface ConfigResponse {
  owner: string
  min_increase: string
  max_auction_duration_block: number
  max_auction_duration_second: number
}

interface CollectionInfosQuery {
  start_after?: string
  limit?: number
}

interface OrdersQuery {
  start_after?: number
  limit?: number
}

// execute msg
interface UpdateConfigExecute {
  onwer?: string
  min_increase?: string
  max_auction_duration_block?: number
  max_auction_duration_second?: number
}

export class NftMarket extends Contract{
  public init(owner: string, min_increase: string, max_auction_duration_block: number, max_auction_duration_second: number): MsgInstantiateContract {
    return this.createInstantiateMsg({ owner, min_increase, max_auction_duration_block, max_auction_duration_second });
  }

  // Execute Msg

  // update config
  public updateConfig(update_config: UpdateConfigExecute) {
    return this.createExecuteMsg({ update_config })
  }

  // add collection
  // requirement: msg_sender == owner
  public addCollection(nft_address: string, support_assets: AssetInfo[], royalties: Royalty[]): MsgExecuteContract {
    const add_collection = { nft_address, support_assets, royalties }
    return this.createExecuteMsg({ add_collection })
  }

  // update collection
  // requirement: msg_sender == owner
  // if you want to delist/remove the collection, set support_asset = []
  // The reason that I didn't put remove_collection function is to avoid error from the order that already made.
  public updateCollection(nft_address: string, support_assets: AssetInfo[], royalties: Royalty[]): MsgExecuteContract {
    const update_collection = { nft_address, support_assets, royalties }
    return this.createExecuteMsg({ update_collection })
  }

  // make fixed price order
  public makeFixedPriceOrder(nft_address: string, token_id: string, price: Asset): MsgExecuteContract {
    const make_fixed_price_order = { price }
    const cw721SendMsg = {
      send_nft: {
        contract: this.contractAddress,
        token_id,
        msg: objectToBase64({ make_fixed_price_order })
      }
    }

    return new MsgExecuteContract(
      this.key.accAddress, 
      nft_address,
      cw721SendMsg
    )
  }

  // make auction
  public makeAuctionOrder(
    nft_address: string, token_id: string, start_price: Asset, expiration: Expiration, fixed_price?: Asset
  ): MsgExecuteContract {
    const make_auction_order = { start_price, expiration, fixed_price }
    const cw721SendMsg = {
      send_nft: {
        contract: this.contractAddress,
        token_id,
        msg: objectToBase64({ make_auction_order} )
      }
    }

    return new MsgExecuteContract(
      this.key.accAddress, 
      nft_address,
      cw721SendMsg
    )
  }

  // execute order, buy nft at fixed price.
  public async executeOrder(order_id: number): Promise<MsgExecuteContract> {
    return this.orderQuery(order_id)
    .then(order => {
      const price = order.price
      if (isNative(price)) {
        const info = price.info as NativeTokenInfo
        const execute_order = { order_id }
        return this.createExecuteMsg({ execute_order }, new Coins(price.amount + info.native_token.denom))
      } else {
        const info = price.info as NonNativeTokenInfo
        const execute_order = { order_id }
        const cw20SendMsg = {
          send: {
            amount: price.amount,
            contract: this.contractAddress,
            msg: objectToBase64({ execute_order})
          }
        }

        return new MsgExecuteContract(
          this.key.accAddress,
          info.token.contract_addr,
          cw20SendMsg
        )
      }
    })
  }

    // bid acution
    public bid(order_id: number, bid_price: Asset): MsgExecuteContract {
      if (isNative(bid_price)) {
        const info = bid_price.info as NativeTokenInfo
        const bid = { order_id, bid_price }
        return this.createExecuteMsg({ bid }, new Coins(bid_price.amount + info.native_token.denom))
      } else {
        const info = bid_price.info as NonNativeTokenInfo
        const bid = { order_id }
        const cw20SendMsg = {
          send: {
            amount: bid_price.amount,
            contract: this.contractAddress,
            msg: objectToBase64({ bid })
          }
        }

        return new MsgExecuteContract(
          this.key.accAddress,
          info.token.contract_addr,
          cw20SendMsg
        )
      }
    }

  // execute auction, execute expired auction
  // anyone can excute this. Maybe protocol owner run the bot for this.
  public executeAuction(order_id: number): MsgExecuteContract {
    const execute_auction = { order_id }
    return this.createExecuteMsg({ execute_auction })
  }

  // cancel order
  // requirement: msg_sender == seller
  public cancelOrder(order_id: number): MsgExecuteContract {
    const cancel_order  = { order_id }
    return this.createExecuteMsg({ cancel_order })
  }

  
  // QueryMsg
  public configQuery(): Promise<ConfigResponse> {
    return this.query({ config: {} })
  }

  public collectionInfoQuery(nft_address: string): Promise<CollectionInfo> {
    const collection_info = { nft_address }
    return this.query({ collection_info })
  }

  public collectionInfosQuery(collection_infos: CollectionInfosQuery): Promise<CollectionInfo[]> {
    return this.query({ collection_infos })
  }

  public orderQuery(order_id: number): Promise<Order> {
    const order = { order_id }
    return this.query({ order })
  }

  public ordersQuery(orders: OrdersQuery): Promise<Order[]> {
    return this.query({ orders })
  }
}


function isNative(asset: Asset): boolean {
  const info = asset.info as any
  if (info.native_token) {
    return true
  } else {
    return false
  }
}

function objectToBase64(input: any): string {
  const stringified = JSON.stringify(input)
  return Buffer.from(stringified).toString('base64')
}