type Token = {
  address: string
  balance: string
}

export type GetEventsReturns = {
  chainName: 'ethereum'
  address: string
  events: {
    abi: string
    accountIndex: number
  }[]
}[]

export type GetAccountsReturns = string[]

export type GetPorfolioChainParam = {
  chainId: number
  chainName: string
  addresses: string[]
}[]

export type GetPorfolioReturns = {
  chainName: string
  supplied: Token[] | Token[][]
}[]

export type GetPorfolio = (chains: GetPorfolioChainParam, account: string) => GetPorfolioReturns
