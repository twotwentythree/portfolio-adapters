import { abi } from '@defillama/sdk/build/api'
import { Chain } from '@defillama/sdk/build/general'
import got from 'got'
import _ from 'lodash'

export default async function getCoins(ids: (string | string[])[][]): Promise<{
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
