import { api } from '@defillama/sdk'
const abi = require('./abi.json')

import type { GetEventsReturns, GetPorfolioChainParam, GetPorfolioReturns } from '../../adapterTypes'

const stakingAddress = '0xBa37B002AbaFDd8E89a1995dA52740bbC013D992'

export async function getEvents(): Promise<GetEventsReturns> {
  return [
    {
      chainName: 'ethereum',
      address: stakingAddress,
      events: [
        {
          abi: 'Staked(address,uint256)',
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
            const stake = (
              await api.abi.call({
                target: address,
                abi: abi.find((obj: { name: string }) => obj.name === 'earned'),
                params: [account],
              })
            ).output

            return [
              {
                address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
                balance: stake,
              },
            ]
          })
        ),
      }
    })
  )
}
