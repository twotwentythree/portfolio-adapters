import { mainnetAddresses } from './mainnetAddresses'

type MakerJoinData = {
  join: string
  gemSymbol: string
  gem: string
  ilk: string
}

export default function getMakerJoinsData(): MakerJoinData[] {
  const gems = Object.keys(mainnetAddresses)
    .filter((key) => key.includes('PIP_'))
    .map((key) => {
      const _gem = key.split('_')[1]

      //? Does not support DIRECT vaults for now
      if (_gem === 'ADAI') return

      return _gem
    })
    .concat(['MCD_DAI']) as (keyof typeof mainnetAddresses | undefined)[]

  const joins: MakerJoinData[] = []

  for (const gem of gems) {
    if (!gem) continue
    if (gem === 'MCD_DAI') {
      joins.push({
        gemSymbol: 'DAI',
        gem: mainnetAddresses[gem],
        ilk: 'DAI',
        join: mainnetAddresses.MCD_JOIN_DAI,
      })
      continue
    }

    const gemJoins = Object.keys(mainnetAddresses).filter(
      (key) => key.includes('MCD_JOIN_') && key.includes(`_${gem}_`)
    ) as (keyof typeof mainnetAddresses)[]

    for (const join of gemJoins) {
      const joinSplit = join.split('_')
      const ilk = joinSplit.slice(joinSplit.length - 2).join('-')

      joins.push({
        join: mainnetAddresses[join],
        gemSymbol: gem === 'ETH' ? 'WETH' : gem,
        gem: mainnetAddresses[gem],
        ilk,
      })
    }
  }

  return joins
}
