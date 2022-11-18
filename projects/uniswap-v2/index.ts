import { api } from '@defillama/sdk'
import BigNumber from 'bignumber.js'

import type { GetEventsReturns, GetPorfolioChainParam, GetPorfolioReturns } from '../../adapterTypes'

import abi from './abi.json'

const factory = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'

export async function getEvents(): Promise<GetEventsReturns> {
  return [
    {
      chainName: 'ethereum',
      address: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc', // USDC/WETh pair
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
    },
  ]
}

export async function getPorfolio(chains: GetPorfolioChainParam, account: string): Promise<GetPorfolioReturns> {
  return Promise.all(
    chains.map(async (chain) => ({
      chainName: chain.chainName,
      supplied: await Promise.all(
        chain.addresses.map(async (address) => {
          const { _reserve0: reserve0, _reserve1: reserve1 } = (
            await api.abi.call({
              target: address,
              abi: abi.find((x) => x.name === 'getReserves'),
            })
          ).output

          const token0 = (
            await api.abi.call({
              target: address,
              abi: abi.find((x) => x.name === 'token0'),
            })
          ).output

          const token1 = (
            await api.abi.call({
              target: address,
              abi: abi.find((x) => x.name === 'token1'),
            })
          ).output

          const totalSupply = (
            await api.abi.call({
              target: address,
              abi: abi.find((x) => x.name === 'totalSupply'),
            })
          ).output

          const liquidity = (
            await api.abi.call({
              target: address,
              abi: abi.find((x) => x.name === 'balanceOf'),
              params: [account],
            })
          ).output

          return [
            {
              address: token0,
              balance: new BigNumber(liquidity).multipliedBy(reserve0).div(totalSupply).toString(),
            },
            {
              address: token1,
              balance: new BigNumber(liquidity).multipliedBy(reserve1).div(totalSupply).toString(),
            },
          ]
        })
      ),
    }))
  )
}
