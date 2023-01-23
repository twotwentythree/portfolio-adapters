import { api } from '@defillama/sdk'
import { Chain } from '@defillama/sdk/build/general'
import { utils } from 'ethers'
import type { Log } from '@ethersproject/abstract-provider'
import { ParseEventsReturns } from '../../adapterTypes'

const MapleLoan = require('./abis/MapleLoan.json')

export default async function parseEvents(chainName: Chain, logs: Log[], account: string): Promise<ParseEventsReturns> {
  const loans = (
    await Promise.all(
      logs.map(async (log): Promise<string | undefined> => {
        const loanAddress = utils.defaultAbiCoder.decode(['address'], log.topics[2])[0]

        const borrower = (
          await api.abi.call({
            target: loanAddress,
            abi: MapleLoan['borrower'],
          })
        ).output as string

        if (borrower.toLowerCase() === account.toLowerCase()) {
          return loanAddress
        }
      })
    )
  ).filter((loan) => loan !== undefined) as string[]

  return { chainName, addresses: loans }
}
