import { api } from '@defillama/sdk'
const abi = require('./abi.json')

import type { GetEventsReturns, GetPorfolioChainParam, GetPorfolioReturns } from '../../adapterTypes'

const contractAddress = '0x3feB1e09b4bb0E7f0387CeE092a52e85797ab889'

export async function getEvents(): Promise<GetEventsReturns> {
  return [
    {
      chainName: 'ethereum',
      address: contractAddress,
      events: [
        {
          abi: 'Migrated(address,uint256,uint256,uint256,bytes)',
          accountIndex: 0,
        },
        {
          abi: 'Staked(address,uint256,uint256)',
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
                abi: abi.find((obj: { name: string }) => obj.name === 'getStake'),
                params: [account],
              })
            ).output

            return [
              {
                address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
                balance: stake,
              },
            ]
          })
        ),
      }
    })
  )
}
