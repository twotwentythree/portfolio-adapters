import 'dotenv/config'

import _ from 'lodash'
import { humanizeNumber } from '@defillama/sdk/build/computeTVL/humanizeNumber'

import { GetEventsReturns, GetPorfolioReturns, GetPorfolioChainParam, ParseEventsReturns } from './adapterTypes'
import getCoins from './utils/getCoins'
import type { Log } from '@ethersproject/abstract-provider'
import { utils } from 'ethers'
import { getProvider } from '@defillama/sdk/build/general'

const project = process.argv[2]
const address = process.argv[3]

;(async () => {
  const adapter = await import(`./projects/${project}`)
  let parseEvents: any

  try {
    parseEvents = await import(`./projects/${project}/parseEvents`)
  } catch (e) {
    console.log('No parseEvents')
  }

  const events: GetEventsReturns = await adapter.getEvents()

  const parsedEventsPromises: Promise<ParseEventsReturns>[] = []

  if (parseEvents) {
    const logsPromises = events.map(async (contract) => {
      const provider = getProvider(contract.chainName)
      const address = contract.address === '*' ? undefined : contract.address
      const currentBlock = await provider.getBlockNumber()

      const finishedLogs: Promise<Log[]>[] = []
      const logsToParse: Promise<Log[]>[] = []

      contract.events.forEach((e) => {
        for (let i = contract.startBlock ?? 0; i < currentBlock; i += 10000) {
          const rawLogs = provider.getLogs({
            fromBlock: i,
            toBlock: i + 10000,
            address,
            topics: [utils.id(e.abi)],
          })

          if (e.shouldParse) logsToParse.push(rawLogs)
          else finishedLogs.push(rawLogs)
        }
      })

      return {
        chainName: contract.chainName,
        finishedLogs: (await Promise.all(finishedLogs)).flat(),
        logsToParse: (await Promise.all(logsToParse)).flat(),
      }
    })

    const logs = await Promise.all(logsPromises)

    logs.forEach((log) => {
      parsedEventsPromises.push(
        parseEvents.default(log.chainName, log.logsToParse, address) as Promise<ParseEventsReturns>
      )
    })
  }

  const parsedEvents = await Promise.all(parsedEventsPromises)

  // TODO
  // if (address == undefined) {

  // }

  const chains: GetPorfolioChainParam = Object.values(_.groupBy(events, (e) => e.chainName)).map(
    (events): GetPorfolioChainParam[0] => ({
      chainName: events[0].chainName,
      addresses: events.map((x) => x.address),
    })
  )

  const chainOutputs: GetPorfolioReturns = await adapter.getPorfolio(chains, address, parsedEvents)

  const coins = await getCoins(
    chainOutputs.map((x) => {
      const suppliedIds = x.supplied.map((y) =>
        Array.isArray(y) ? y.map((z) => `${x.chainName}:${z.address}`) : `${x.chainName}:${y.address}`
      )

      const borrowedIds = x.borrowed?.map((y) => `${x.chainName}:${y.address}`) ?? []

      return suppliedIds.concat(borrowedIds.filter((x) => !suppliedIds.includes(x)))
    })
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

    if (chainOutput.borrowed && chainOutput.borrowed.length > 0) {
      console.log('\nBorrowed:')

      chainOutput.borrowed.forEach((borrowed) => {
        if (borrowed.balance !== '0') {
          const coin = coins[`${chainOutput.chainName}:${borrowed.address}`]
          const balance = Number(borrowed.balance) / 10 ** coin.decimals
          const value = balance * coin.price
          total -= value
          console.log(`${coin.symbol.padEnd(30)} ${humanizeNumber(balance).padEnd(30)} $${humanizeNumber(value)}`)
        }
      })
    }

    console.log(`\n${'Total:'.padEnd(61)} $${humanizeNumber(total)}`)
    if (chainOutput.healthFactor) {
      console.log(`${'Health factor:'.padEnd(61)} ${chainOutput.healthFactor}`)
    }

    console.log('')
  })
})()
