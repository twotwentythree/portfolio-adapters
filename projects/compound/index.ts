import { api } from '@defillama/sdk'
import { BigNumber } from 'ethers'

const abi = require('./abi.json')
const lens = require('./lens.json')

import type { GetEventsReturns, GetPorfolioChainParam, GetPorfolioReturns } from '../../adapterTypes'

const markets = [
  {
    underlying: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
    symbol: 'BAT',
    decimals: 18,
    cToken: '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E',
  },
  {
    underlying: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI',
    decimals: 18,
    cToken: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
  },
  {
    underlying: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    symbol: 'WETH',
    decimals: 18,
    cToken: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
  }, //cETH => WETH
  {
    underlying: '0x1985365e9f78359a9B6AD760e32412f4a445E862',
    symbol: 'REP',
    decimals: 18,
    cToken: '0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1',
  },
  {
    underlying: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    decimals: 6,
    cToken: '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
  },
  {
    underlying: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    decimals: 6,
    cToken: '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',
  },
  {
    underlying: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    symbol: 'WBTC',
    decimals: 8,
    cToken: '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4', //cWBTC - legacy
  },
  {
    underlying: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    symbol: 'WBTC',
    decimals: 8,
    cToken: '0xccf4429db6322d5c611ee964527d42e5d685dd6a', //cWBTC
  },
  {
    underlying: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
    symbol: 'ZRX',
    decimals: 18,
    cToken: '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407',
  },
  {
    underlying: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
    symbol: 'SAI',
    decimals: 18,
    cToken: '0xF5DCe57282A584D2746FaF1593d3121Fcac444dC',
  },
]

// Used to get all accounts that have used certain contracts
// List all deposit/transfer actions
export function getEvents(): GetEventsReturns {
  return markets.map((market) => ({
    chainName: 'ethereum',
    address: market.cToken,
    events: [
      {
        abi: 'Mint(address,uint256,uint256)',
        accountIndex: 0,
      },
      {
        abi: 'Transfer(address,address,uint256)',
        accountIndex: 1,
      },
      {
        abi: 'Borrow(address,uint256,uint256,uint256)',
        accountIndex: 0,
      },
    ],
  }))
}

// Used to get all account relevant to a protocol without querying the blockchain
// Can be used to airdrop or cross chain rewards
// export function getAccounts(): Promise<string[]> {

// }

export function getPorfolio(chains: GetPorfolioChainParam, account: string): Promise<GetPorfolioReturns> {
  return Promise.all(
    chains.map(async (chain) => {
      return {
        chainName: chain.chainName,
        supplied: await Promise.all(
          chain.addresses.map(async (address) => {
            const underlying = markets.find((x) => x.cToken.toLowerCase() === address.toLowerCase())!.underlying

            const balance = (
              await api.abi.call({
                target: address,
                abi: abi['balanceOfUnderlying'],
                params: [account],
              })
            ).output

            return {
              address: underlying,
              balance: balance,
            }
          })
        ),
        borrowed: await Promise.all(
          markets.map(async (market) => {
            const balance = (
              await api.abi.call({
                target: '0xdCbDb7306c6Ff46f77B349188dC18cEd9DF30299',
                abi: lens['cTokenBalances'],
                params: [market.cToken, account],
              })
            ).output.borrowBalanceCurrent

            return {
              address: market.underlying,
              balance: balance,
            }
          })
        ),
        healthFactor: await (async () => {
          const metadata = (
            await api.abi.call({
              target: '0xdCbDb7306c6Ff46f77B349188dC18cEd9DF30299',
              abi: lens['cTokenMetadataAll'],
              // @ts-ignore
              params: [markets.map((m) => m.cToken)],
            })
          ).output
          const underlyingPrices = (
            await api.abi.call({
              target: '0xdCbDb7306c6Ff46f77B349188dC18cEd9DF30299',
              abi: lens['cTokenUnderlyingPriceAll'],
              // @ts-ignore
              params: [markets.map((m) => m.cToken)],
            })
          ).output
          const borrowBalances = (
            await api.abi.call({
              target: '0xdCbDb7306c6Ff46f77B349188dC18cEd9DF30299',
              abi: lens['cTokenBalancesAll'],
              // @ts-ignore
              params: [markets.map((m) => m.cToken), account],
            })
          ).output

          const sumOfUnderlying: BigNumber = markets.reduce((sum, _, index) => {
            const collateralFactor = BigNumber.from(metadata[index]?.collateralFactorMantissa)
            const underlyingPrice = BigNumber.from(underlyingPrices[index]?.underlyingPrice)
            const balanceOfUnderlying = BigNumber.from(borrowBalances[index]?.balanceOfUnderlying)
            const balance = balanceOfUnderlying.mul(underlyingPrice).mul(collateralFactor)
            return balance ? sum.add(balance) : sum
          }, BigNumber.from(0))

          const sumOfBalance: BigNumber = markets.reduce((sum, _, index) => {
            const underlyingPrice = BigNumber.from(underlyingPrices[index]?.underlyingPrice)
            const borrowBalance = BigNumber.from(borrowBalances[index]?.borrowBalanceCurrent)
            const balance = borrowBalance.mul(underlyingPrice)
            return balance ? sum.add(balance) : sum
          }, BigNumber.from(0))

          if (!sumOfBalance || !sumOfUnderlying) {
            return BigNumber.from(0).toString()
          }
          return sumOfUnderlying.div(sumOfBalance).toString()
        })(),
      }
    })
  )
}
