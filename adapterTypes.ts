import type { Chain } from '@defillama/sdk/build/general'

type Token = {
  address: string
  balance: string
}

export type GetEventsReturns = {
  chainName: Chain
  address: string
  events: {
    abi: string
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
  borrowed?: {
    address: string
    balance: string
  }[]
  healthFactor?: string
}[]

export type GetPorfolio = (chains: GetPorfolioChainParam, account: string) => GetPorfolioReturns
