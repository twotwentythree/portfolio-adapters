import 'dotenv/config'

import { humanizeNumber } from '@defillama/sdk/build/computeTVL/humanizeNumber'
import _ from 'lodash'
import got from 'got'

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

  const chainOutputs: GetPorfolioReturns = await adapter.getPorfolio(chains, address)

  const { coins } = await got(
    `https://coins.llama.fi/prices/current/${_.flattenDeep([
      chainOutputs.map((x) =>
        x.supplied.map((y) =>
          Array.isArray(y) ? y.map((z) => `${x.chainName}:${z.address}`) : `${x.chainName}:${y.address}`
        )
      ),
    ]).join(',')}`
  ).json<{
    coins: {
      [key: string]: {
        decimals: number
        symbol: string
        price: number
        timestamp: number
        confidence: number
      }
    }
  }>()

  chainOutputs.forEach((chainOutput) => {
    console.log('--- ethereum ---')

    chainOutput.supplied.forEach((s) => {
      ;(Array.isArray(s) ? s : [s]).forEach((supplied) => {
        if (supplied.balance !== '0') {
          const coin = coins[`${chainOutput.chainName}:${supplied.address}`]
          const balance = Number(supplied.balance) / 10 ** coin.decimals
          const value = balance * coin.price
          console.log(`${coin.symbol.padEnd(30)} ${humanizeNumber(balance).padEnd(30)} $${humanizeNumber(value)}`)
        }
      })
    })
  })

  console.log('')
})()
