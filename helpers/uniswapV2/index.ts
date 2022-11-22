import { api } from '@defillama/sdk'
import { Chain } from '@defillama/sdk/build/general'
import BigNumber from 'bignumber.js'

import type { GetEventsReturns, GetPorfolioChainParam, GetPorfolioReturns } from '../../adapterTypes'

import pairAbi from './abis/pair.json'
import factoryAbi from './abis/factory.json'

export async function getUniswapEvents(chain: Chain, factory: string): Promise<GetEventsReturns> {
  const pairsLength = (
    await api.abi.call({
      chain: chain,
      target: factory,
      abi: factoryAbi.find((x) => x.name === 'allPairsLength'),
    })
  ).output

  const pairAddresses = (
    await api.abi.multiCall({
      chain: chain,
      abi: factoryAbi.find((x) => x.name === 'allPairs'),
      calls: Array.from({ length: Number(pairsLength) }).map((_, i) => ({
        target: factory,
        params: [i],
      })),
    })
  ).output.map((x) => x.output)

  return pairAddresses.map((pairAddress) => ({
    chainName: chain,
    address: pairAddress,
    events: [
      {
        abi: 'Mint(address,uint,uint)',
        accountIndex: 0,
      },
      {
        abi: 'Transfer(address,address,uint)',
        accountIndex: 1,
      },
    ],
  }))
}

export async function getUniswapPortfolio(chains: GetPorfolioChainParam, account: string): Promise<GetPorfolioReturns> {
  return Promise.all(
    chains.map(async (chain): Promise<GetPorfolioReturns[0]> => {
      const balanceOfResults = (
        await api.abi.multiCall({
          chain: chain.chainName,
          abi: pairAbi.find((x) => x.name === 'balanceOf'),
          calls: chain.addresses.map((address) => ({
            target: address,
            params: [account],
          })),
        })
      ).output

      const pairsWithLiquidity = balanceOfResults.filter((x) => x.output !== '0')
      const liquidities = pairsWithLiquidity.map((x) => x.output)
      const pairs = pairsWithLiquidity.map((x) => x.input.target)

      const reserves = (
        await api.abi.multiCall({
          chain: chain.chainName,
          abi: pairAbi.find((x) => x.name === 'getReserves'),
          calls: pairs.map((pair) => ({
            target: pair,
          })),
        })
      ).output.map((x) => ({ reserve0: x.output._reserve0, reserve1: x.output._reserve1 }))

      const token0s = (
        await api.abi.multiCall({
          chain: chain.chainName,
          abi: pairAbi.find((x) => x.name === 'token0'),
          calls: pairs.map((pair) => ({
            target: pair,
          })),
        })
      ).output.map((x) => x.output)

      const token1s = (
        await api.abi.multiCall({
          chain: chain.chainName,
          abi: pairAbi.find((x) => x.name === 'token1'),
          calls: pairs.map((pair) => ({
            target: pair,
          })),
        })
      ).output.map((x) => x.output)

      const totalSupplies = (
        await api.abi.multiCall({
          chain: chain.chainName,
          abi: pairAbi.find((x) => x.name === 'totalSupply'),
          calls: pairs.map((pair) => ({
            target: pair,
          })),
        })
      ).output.map((x) => x.output)

      return {
        chainName: chain.chainName,
        supplied: liquidities.map((liquidity, i) => [
          {
            address: token0s[i],
            balance: new BigNumber(liquidity).multipliedBy(reserves[i].reserve0).div(totalSupplies[i]).toString(),
          },
          {
            address: token1s[i],
            balance: new BigNumber(liquidity).multipliedBy(reserves[i].reserve1).div(totalSupplies[i]).toString(),
          },
        ]),
      }
    })
  )
}
