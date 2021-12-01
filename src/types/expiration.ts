export interface ExpirationAtHeight {
  at_height: number
}

export interface ExpirationAtTime {
  at_time: number
}

export interface ExpirationNever {
  never: {}
}

export type Expiration =
  | ExpirationAtHeight
  | ExpirationAtTime
  | ExpirationNever;
  