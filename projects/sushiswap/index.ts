import type { GetEventsReturns, GetPorfolioChainParam, GetPorfolioReturns } from '../../adapterTypes'

import { getUniswapEvents, getUniswapPortfolio } from '../../helpers/uniswapV2'

export async function getEvents(): Promise<GetEventsReturns> {
  return getUniswapEvents([
    {
      chain: 'ethereum',
      factory: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
    },
    {
      chain: 'arbitrum',
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    },
    {
      chain: 'telos',
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    },
    {
      chain: 'xdai',
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    },
    {
      chain: 'fuse',
      factory: '0x43eA90e2b786728520e4f930d2A71a477BF2737C',
    },
    {
      chain: 'harmony',
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    },
    {
      chain: 'heco',
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    },
    // {
    //   chain: 'kovan',
    //   factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    // },
    {
      chain: 'polygon',
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    },
    {
      chain: 'moonbeam',
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    },
    {
      chain: 'moonriver',
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    },
    {
      chain: 'okexchain',
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    },
    {
      chain: 'avax',
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    },
    {
      chain: 'boba',
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    },
    {
      chain: 'bsc',
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    },
    {
      chain: 'celo',
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    },
    {
      chain: 'fantom',
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    },
  ])
}

export async function getPorfolio(chains: GetPorfolioChainParam, account: string): Promise<GetPorfolioReturns> {
  return getUniswapPortfolio(chains, account)
}
