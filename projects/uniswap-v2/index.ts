import type { GetEventsReturns, GetPorfolioChainParam, GetPorfolioReturns } from '../../adapterTypes'
import { getUniswapEvents, getUniswapPortfolio } from '../../helpers/uniswapV2'

const factory = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'

export async function getEvents(): Promise<GetEventsReturns> {
  return getUniswapEvents([
    {
      chain: 'ethereum',
      factory,
    },
  ])
}

export async function getPorfolio(chains: GetPorfolioChainParam, account: string): Promise<GetPorfolioReturns> {
  return getUniswapPortfolio(chains, account)
}
