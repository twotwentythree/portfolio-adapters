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
            const apeCoinStake = (
              await api.abi.call({
                target: address,
                abi: abi.find((obj: { name: string }) => obj.name === 'getApeCoinStake'),
                params: [account],
              })
            ).output

            const baycStakes = (
              await api.abi.call({
                target: address,
                abi: abi.find((obj: { name: string }) => obj.name === 'getBaycStakes'),
                params: [account],
              })
            ).output

            const maycStakes = (
              await api.abi.call({
                target: address,
                abi: abi.find((obj: { name: string }) => obj.name === 'getMaycStakes'),
                params: [account],
              })
            ).output

            const bakcStakes = (
              await api.abi.call({
                target: address,
                abi: abi.find((obj: { name: string }) => obj.name === 'getBakcStakes'),
                params: [account],
              })
            ).output

            return [
              {
                address: '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
                balance: apeCoinStake.deposited,
              },
              {
                address: '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
                balance: baycStakes.reduce((acc: any, s: { deposited: any }) => acc + Number(s.deposited), 0),
              },
              {
                address: '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
                balance: maycStakes.reduce((acc: any, s: { deposited: any }) => acc + Number(s.deposited), 0),
              },
              {
                address: '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
                balance: bakcStakes.reduce((acc: any, s: { deposited: any }) => acc + Number(s.deposited), 0),
              },
            ]
          })
        ),
      }
    })
  )
}
