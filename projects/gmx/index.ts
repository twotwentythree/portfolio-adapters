import { api } from '@defillama/sdk'
const abi = require('./abi.json')

import type { GetEventsReturns, GetPorfolioChainParam, GetPorfolioReturns } from '../../adapterTypes'

const stakingAddress = '0xd2D1162512F927a7e282Ef43a362659E4F2a728F'

export async function getEvents(): Promise<GetEventsReturns> {
  return [
    {
      chainName: 'arbitrum',
      address: stakingAddress,
      events: [
        {
          abi: 'Transfer(address, address, uint256)',
          accountIndex: 1,
        },
        {
          abi: 'Claim(address, uint256)',
          accountIndex: 0,
        },
      ],
    },
  ]
}

export async function getPorfolio(chains: GetPorfolioChainParam, account: string): Promise<GetPorfolioReturns> {
  return Promise.all(
    chains.map(async (chain) => {
      return {
        chainName: chain.chainName,
        supplied: await Promise.all(
          chain.addresses.map(async (address) => {
            const balanceOf = (
              await api.abi.call({
                target: address,
                abi: abi.find((obj: { name: string }) => obj.name === 'balanceOf'),
                params: [account],
              })
            ).output

            const claimable = (
              await api.abi.call({
                target: address,
                abi: abi.find((obj: { name: string }) => obj.name === 'claimable'),
                params: [account],
              })
            ).output

            const cumulativeRewards = (
              await api.abi.call({
                target: address,
                abi: abi.find((obj: { name: string }) => obj.name === 'cumulativeRewards'),
                params: [account],
              })
            ).output

            const stakedAmounts = (
              await api.abi.call({
                target: address,
                abi: abi.find((obj: { name: string }) => obj.name === 'stakedAmounts'),
                params: [account],
              })
            ).output

            return [
              {
                address: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
                balance: balanceOf,
              },
              {
                address: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
                balance: claimable,
              },
              {
                address: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
                balance: cumulativeRewards,
              },
              {
                address: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
                balance: stakedAmounts,
              },
            ]
          })
        ),
      }
    })
  )
}
