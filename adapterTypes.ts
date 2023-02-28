import type { Chain } from '@defillama/sdk/build/general'

export type Token = {
  address: string
  balance: string
}

export type GetEventsReturns = {
  chainName: Chain
  address: string
  events: {
    abi: string
    topicsLength?: number
    accountIndex: number
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

export type Chain = Chain
