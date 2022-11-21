import 'dotenv/config'

import _ from 'lodash'
import got from 'got'
import { humanizeNumber } from '@defillama/sdk/build/computeTVL/humanizeNumber'
import { abi } from '@defillama/sdk/build/api'
import { Chain } from '@defillama/sdk/build/general'

import { GetEventsReturns, GetPorfolioReturns, GetPorfolioChainParam } from './adapterTypes'

const project = process.argv[2]
const address = process.argv[3]

;(async () => {
  const adapter = await import(`./projects/${project}`)

  const events: GetEventsReturns = await adapter.getEvents()

  // TODO
  // if (address == undefined) {

  // }

  const chains: GetPorfolioChainParam = Object.values(_.groupBy(events, (e) => e.chainName)).map(
    (events): GetPorfolioChainParam[0] => ({
      chainName: events[0].chainName,
      addresses: events.map((x) => x.address),
    })
  )

  const chainOutputs: GetPorfolioReturns = await adapter.getPorfolio(chains, address)

  const coins = await getCoins(
    chainOutputs.map((x) =>
      x.supplied.map((y) =>
        Array.isArray(y) ? y.map((z) => `${x.chainName}:${z.address}`) : `${x.chainName}:${y.address}`
      )
    )
  )

  chainOutputs.forEach((chainOutput) => {
    console.log(`--- ${chainOutput.chainName} ---`)

    let total = 0

    chainOutput.supplied.forEach((s) => {
      ;(Array.isArray(s) ? s : [s]).forEach((supplied) => {
        if (supplied.balance !== '0') {
          const coin = coins[`${chainOutput.chainName}:${supplied.address}`]
          const balance = Number(supplied.balance) / 10 ** coin.decimals
          const value = balance * coin.price
          total += value
          console.log(`${coin.symbol.padEnd(30)} ${humanizeNumber(balance).padEnd(30)} $${humanizeNumber(value)}`)
        }
      })
    })

    console.log(`\n${'Total:'.padEnd(61)} $${humanizeNumber(total)}`)
  })

  console.log('')
})()

async function getCoins(ids: (string | string[])[][]): Promise<{
  [key: string]: {
    decimals: number
    symbol: string
    price: number
    timestamp: number
    confidence: number
  }
}> {
  const uniqIds = _.uniq(_.flattenDeep(ids))

  const coins = _.merge(
    {},
    ...(await Promise.all(
      _.chunk(uniqIds, 100).map(async (ids) => {
        const { coins } = await got(`https://coins.llama.fi/prices/current/${ids.join(',')}`).json<{
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

        return coins
      })
    ))
  )

  const coinsNotFound = uniqIds.filter((id) => !coins[id])
  await Promise.all(
    coinsNotFound.map(async (coin) => {
      const [chain, address] = coin.split(':')

      const symbol = await (
        await abi.call({
          chain: chain as Chain,
          target: address,
          abi: 'erc20:symbol',
        })
      ).output

      const decimals = await (
        await abi.call({
          chain: chain as Chain,
          target: address,
          abi: 'erc20:decimals',
        })
      ).output

      coins[coin] = {
        decimals,
        symbol,
        price: 0,
        timestamp: Math.floor(new Date().getTime() / 1000),
        confidence: 0,
      }
    })
  )

  return coins
}
