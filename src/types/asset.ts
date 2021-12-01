export interface Asset {
  info: AssetInfo
  amount: string
}

export type AssetInfo = NativeTokenInfo | NonNativeTokenInfo

export interface NativeTokenInfo {
  native_token: {
    denom: string
  }
}

export interface NonNativeTokenInfo {
  token: {
    contract_addr: string
  }
}