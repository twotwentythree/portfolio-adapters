import { api } from '@defillama/sdk'

import type { GetEventsReturns, GetPorfolioChainParam, GetPorfolioReturns } from '../../adapterTypes'

export async function getEvents(): Promise<GetEventsReturns> {
  return [
    {
      chainName: 'ethereum',
      address: '*',
      events: [
        {
          abi: 'Transfer(address,address,uint256)',
          topicsLength: 3,
          accountIndex: 1,
        },
      ],
    },
  ]
}

export async function getPorfolio(chains: GetPorfolioChainParam, account: string): Promise<GetPorfolioReturns> {
  return Promise.all(
    chains.map(async ({ chainName, addresses }) => {
      return {
        chainName,
        supplied: await Promise.all(
          addresses.map(async (address) => ({
            address,
            balance: await api.erc20
              .balanceOf({
                chain: chainName,
                target: address,
                owner: account,
              })
              .then((x) => x.output),
          }))
        ),
      }
    })
  )
}
