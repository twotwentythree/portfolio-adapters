import type { GetEventsReturns, GetPorfolioChainParam, GetPorfolioReturns } from '../../adapterTypes'

import { getUniswapEvents, getUniswapPortfolio } from '../../helpers/uniswapV2'

export async function getEvents(): Promise<GetEventsReturns> {
  return getUniswapEvents([
    {
      chain: 'ethereum',
      factory: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
    },
  ])
}

export async function getPorfolio(chains: GetPorfolioChainParam, account: string): Promise<GetPorfolioReturns> {
  return getUniswapPortfolio(chains, account)
}
