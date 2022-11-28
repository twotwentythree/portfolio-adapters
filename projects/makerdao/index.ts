import type {
  GetAccountsReturns,
  GetEventsReturns,
  GetPorfolioChainParam,
  GetPorfolioReturns,
} from '../../adapterTypes'
import getMakerVaults from './getMakerVaults'

const vaults = getMakerVaults()

export async function getEvents(): Promise<GetEventsReturns> {
  return []
}

export async function getAccounts(): Promise<GetAccountsReturns> {
  return []
}

export async function getPorfolio(chains: GetPorfolioChainParam, account: string): Promise<GetPorfolioReturns> {
  return []
}
