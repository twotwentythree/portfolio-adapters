import type { GetEventsReturns, GetPorfolioChainParam, GetPorfolioReturns } from '../../adapterTypes'

import { getUniswapEvents, getUniswapPortfolio } from '../../helpers/uniswapV2'

export async function getEvents(): Promise<GetEventsReturns> {
  return [
    ...(await getUniswapEvents('ethereum', '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac')),
    ...(await getUniswapEvents('arbitrum', '0xc35DADB65012eC5796536bD9864eD8773aBc74C4')),
    ...(await getUniswapEvents('telos', '0xc35DADB65012eC5796536bD9864eD8773aBc74C4')),
    ...(await getUniswapEvents('xdai', '0xc35DADB65012eC5796536bD9864eD8773aBc74C4')),
    ...(await getUniswapEvents('fuse', '0x43eA90e2b786728520e4f930d2A71a477BF2737C')),
    ...(await getUniswapEvents('harmony', '0xc35DADB65012eC5796536bD9864eD8773aBc74C4')),
    ...(await getUniswapEvents('heco', '0xc35DADB65012eC5796536bD9864eD8773aBc74C4')),
    // ...(await getUniswapEvents('kovan','0xc35DADB65012eC5796536bD9864eD8773aBc74C4')),
    ...(await getUniswapEvents('polygon', '0xc35DADB65012eC5796536bD9864eD8773aBc74C4')),
    ...(await getUniswapEvents('moonbeam', '0xc35DADB65012eC5796536bD9864eD8773aBc74C4')),
    ...(await getUniswapEvents('moonriver', '0xc35DADB65012eC5796536bD9864eD8773aBc74C4')),
    ...(await getUniswapEvents('okexchain', '0xc35DADB65012eC5796536bD9864eD8773aBc74C4')),
    ...(await getUniswapEvents('avax', '0xc35DADB65012eC5796536bD9864eD8773aBc74C4')),
    ...(await getUniswapEvents('boba', '0xc35DADB65012eC5796536bD9864eD8773aBc74C4')),
    ...(await getUniswapEvents('bsc', '0xc35DADB65012eC5796536bD9864eD8773aBc74C4')),
    ...(await getUniswapEvents('celo', '0xc35DADB65012eC5796536bD9864eD8773aBc74C4')),
    ...(await getUniswapEvents('fantom', '0xc35DADB65012eC5796536bD9864eD8773aBc74C4')),
  ]
}

export async function getPorfolio(chains: GetPorfolioChainParam, account: string): Promise<GetPorfolioReturns> {
  return getUniswapPortfolio(chains, account)
}
