import 'dotenv/config'

import { humanizeNumber } from '@defillama/sdk/build/computeTVL/humanizeNumber'

import { GetEventsReturns, GetPorfolioReturns } from './adapterTypes'

const project = process.argv[2]
const address = process.argv[3]

;(async () => {
  const adapter = await import(`./projects/${project}`)

  const events: GetEventsReturns[] = await adapter.getEvents()

  // TODO
  // if (address == undefined) {

  // }

  const chains = [
    {
      chainId: 1,
      chainName: 'ethereum',
      // @ts-ignore
      addresses: events.map((x) => x.address),
    },
  ]

  const chainOutputs: GetPorfolioReturns[] = await adapter.getPorfolio(chains, address)

  chainOutputs.forEach((chainOutput) => {
    console.log('--- ethereum ---')

    chainOutput.supplied.forEach((supplied) => {
      if (supplied.balance !== '0') {
        console.log(`${supplied.address}: ${humanizeNumber(Number(supplied.balance) / 1e18)}`)
      }
    })
  })

  console.log('')
})()
