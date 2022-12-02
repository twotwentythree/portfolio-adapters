import type { GetEventsReturns, GetPorfolioChainParam, GetPorfolioReturns, Token } from '../../adapterTypes'
import { mainnetAddresses } from './mainnetAddresses'
import getMakerJoinsData from './getMakerJoinsData'
import { api } from '@defillama/sdk'
import { BigNumber } from 'ethers'

const ProxyRegistry = require('./abis/ProxyRegistry.json')
const IlkRegistry = require('./abis/IlkRegistry.json')
const GetCdps = require('./abis/GetCdps.json')
const Vat = require('./abis/Vat.json')

const joins = getMakerJoinsData()

const DAI = mainnetAddresses.MCD_DAI
const VAT = mainnetAddresses.MCD_VAT
const PROXY_REGISTRY = mainnetAddresses.PROXY_REGISTRY
const ILK_REGISTRY = mainnetAddresses.ILK_REGISTRY
const CDP_MANAGER = mainnetAddresses.CDP_MANAGER
const GET_CDPS = mainnetAddresses.GET_CDPS

export function getEvents(): GetEventsReturns {
  const events: GetEventsReturns = [
    {
      chainName: 'ethereum',
      address: CDP_MANAGER,
      events: [
        {
          abi: 'NewCdp(address,address,uint256)',
          accountIndex: 1,
        },
      ],
    },
    {
      chainName: 'ethereum',
      address: DAI,
      events: [
        {
          abi: 'Transfer(address,address,uint256)',
          accountIndex: 1,
        },
      ],
    },
  ]

  for (const join of joins) {
    events.push({
      chainName: 'ethereum',
      address: join.join,
      events: [
        {
          abi: 'Join(address,uint256)',
          accountIndex: 0,
        },
        {
          abi: 'Exit(address,uint256)',
          accountIndex: 0,
        },
      ],
    })
  }

  return events
}

// export async function getAccounts(): Promise<GetAccountsReturns> {
//   return []
// }

const RAY = BigNumber.from(10).pow(27)

export async function getPorfolio(chains: GetPorfolioChainParam, account: string): Promise<GetPorfolioReturns> {
  return Promise.all(
    chains.map(async (chain) => {
      const proxy = (
        await api.abi.call({
          target: PROXY_REGISTRY,
          abi: ProxyRegistry['proxies'],
          params: [account],
        })
      ).output

      const { ids, urns, ilks } = (
        await api.abi.call({
          target: GET_CDPS,
          abi: GetCdps['getCdpsAsc'],
          params: [CDP_MANAGER, proxy],
        })
      ).output

      const supplied: Token[] = []
      const borrowed: Token[] = []

      for (let i = 0; i < ids.length; i++) {
        const { ink, art }: { ink: string; art: string } = (
          await api.abi.call({
            target: VAT,
            abi: Vat['urns'],
            params: [ilks[i], urns[i]],
          })
        ).output

        const ilk = (
          await api.abi.call({
            target: VAT,
            abi: Vat['ilks'],
            params: [ilks[i]],
          })
        ).output

        const gem = (
          await api.abi.call({
            target: ILK_REGISTRY,
            abi: IlkRegistry['gem'],
            params: [ilks[i]],
          })
        ).output as string

        const decimals = (
          await api.abi.call({
            target: gem,
            abi: 'erc20:decimals',
          })
        ).output as string

        // We need to convert the ink to the correct decimals because Maker stores them in 18 decimals
        const formattedInk = BigNumber.from(ink)
          .div(BigNumber.from(10).pow(18 - parseInt(decimals)))
          .toString()

        supplied.push({
          address: gem,
          balance: formattedInk,
        })

        const borrowedBalance = BigNumber.from(art).mul(BigNumber.from(ilk.rate)).div(RAY).toString()

        borrowed.push({
          address: DAI,
          balance: borrowedBalance,
        })
      }

      // had to add this because user does not borrow gem but DAI
      supplied.push({
        address: DAI,
        balance: '0',
      })

      return {
        chainName: chain.chainName,
        supplied,
        borrowed,
      }
    })
  )
}
