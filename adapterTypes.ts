import type { Chain } from '@defillama/sdk/build/general'

export type Token = {
  address: string
  balance: string
}

export type GetEventsReturns = {
  chainName: Chain
  address: string
  startBlock?: number
  events: {
    abi: string
    accountIndex: number
    shouldParse?: boolean
  }[]
}[]

export type GetAccountsReturns = string[]

export type GetPorfolioChainParam = {
  chainName: Chain
  addresses: string[]
}[]

export type GetPorfolioReturns = {
  chainName: Chain
  supplied: Token[] | Token[][]
  borrowed?: Token[]
  healthFactor?: number
}[]

export type GetPorfolio = (chains: GetPorfolioChainParam, account: string) => GetPorfolioReturns

export type ParseEventsReturns = {
  chainName: Chain
  addresses: string[]
}
