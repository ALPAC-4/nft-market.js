import { Asset, AssetInfo } from './asset'
import { Expiration } from './expiration'

export interface Royalty {
  address: string
  royalty_rate: string
}

export interface Order {
  id: number
  seller_address: string
  nft_address: string
  token_id: string
  price?: Asset
  auction_info?: AuctionInfo
}

export interface CollectionInfo {
  nft_address: string
  support_assets: AssetInfo[]
  royalties: Royalty[]
}

export interface AuctionInfo {
  highest_bid: Asset,
  // if None, no bid yet.
  bidder?: string,
  expiration: Expiration
}