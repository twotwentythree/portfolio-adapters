import { api } from '@defillama/sdk'
import type {
  GetEventsReturns,
  GetPorfolioChainParam,
  GetPorfolioReturns,
  ParseEventsReturns,
} from '../../adapterTypes'

const MapleLoan = require('./abis/MapleLoan.json')

const MapleLoanFactory = '0x36a7350309B2Eb30F3B908aB0154851B5ED81db0'

export function getEvents(): GetEventsReturns {
  return [
    {
      chainName: 'ethereum',
      address: MapleLoanFactory,
      // creation of MapleLoanFactory
      startBlock: 13997864,
      events: [
        {
          abi: 'InstanceDeployed(uint256,address,bytes)',
          accountIndex: 2,
          shouldParse: true,
        },
      ],
    },
  ]
}

// export async function getAccounts(): Promise<GetAccountsReturns> {
//   return []
// }

export async function getPorfolio(
  chains: GetPorfolioChainParam,
  account: string,
  parsedEvents: ParseEventsReturns[]
): Promise<GetPorfolioReturns> {
  return Promise.all(
    chains.map(async (chain) => {
      const loans = parsedEvents.filter((parsedEvent) => parsedEvent.chainName === chain.chainName)[0].addresses

      return {
        chainName: chain.chainName,
        supplied: await Promise.all(
          loans.map(async (loan) => {
            const collateralAsset = (
              await api.abi.call({
                target: loan,
                abi: MapleLoan['collateralAsset'],
              })
            ).output as string

            const collateralAmount = (
              await api.abi.call({
                target: loan,
                abi: MapleLoan['collateral'],
              })
            ).output as string

            return {
              address: collateralAsset,
              balance: collateralAmount,
            }
          })
        ),
        borrowed: await Promise.all(
          loans.map(async (loan) => {
            const principalAsset = (
              await api.abi.call({
                target: loan,
                abi: MapleLoan['fundsAsset'],
              })
            ).output as string

            const principalAmount = (
              await api.abi.call({
                target: loan,
                abi: MapleLoan['principal'],
              })
            ).output as string

            return {
              address: principalAsset,
              balance: principalAmount,
            }
          })
        ),
      }
    })
  )
}
