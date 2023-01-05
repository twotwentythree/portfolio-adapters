import { api } from '@defillama/sdk'
const abi = require('./abi.json')

import type { GetEventsReturns, GetPorfolioChainParam, GetPorfolioReturns } from '../../adapterTypes'

const contractAddress = '0x5954aB967Bc958940b7EB73ee84797Dc8a2AFbb9'

export async function getEvents(): Promise<GetEventsReturns> {
  return [
    {
      chainName: 'ethereum',
      address: contractAddress,
      events: [
        {
          abi: 'Deposit(address,uint256,address)',
          accountIndex: 0,
        },
        {
          abi: 'DepositNft(address,uint256,uint256,uint256)',
          accountIndex: 0,
        },
        {
          abi: 'DepositPairNft(address,uint256,uint256,uint256,uint256)',
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
            const stakedTotal = (
              await api.abi.call({
                target: address,
                abi: abi.find((obj: { name: string }) => obj.name === 'stakedTotal'),
                params: [account],
              })
            ).output

            return [
              {
                address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
                balance: stakedTotal,
              },
            ]
          })
        ),
      }
    })
  )
}
