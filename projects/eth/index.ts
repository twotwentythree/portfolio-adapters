import { api } from '@defillama/sdk'

import type { GetEventsReturns, GetPorfolioChainParam, GetPorfolioReturns } from '../../adapterTypes'

export async function getEvents(): Promise<GetEventsReturns> {
  return [
    {
      chainName: 'ethereum',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      events: [
        {
          abi: 'Transfer(address,address,uint256)',
          accountIndex: 1,
        },
      ],
    },
  ]
}

export async function getPorfolio(chains: GetPorfolioChainParam, account: string): Promise<GetPorfolioReturns> {
  return Promise.all(
    chains.map(async ({ chainName }) => {
      const { output: balance } = await api.eth.getBalance({
        chain: chainName,
        target: account,
      })

      return {
        chainName,
        supplied: [
          {
            address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
            balance,
          },
        ],
      }
    })
  )
}
