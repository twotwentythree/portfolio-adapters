import { mainnetAddresses } from './mainnetAddresses'

type MakerVault = {
  symbol: string
  gem: string
  ilk: string
  join: string
}

export default function getMakerVaults(): MakerVault[] {
  const gems = Object.keys(mainnetAddresses)
    .filter((key) => key.includes('PIP_'))
    .map((key) => {
      const _gem = key.split('_')[1]

      //? Does not support DIRECT vaults for now
      if (_gem === 'ADAI') return

      return _gem
    })
    .concat(['MCD_DAI']) as (keyof typeof mainnetAddresses | undefined)[]

  const vaults: MakerVault[] = []

  for (const gem of gems) {
    if (!gem) continue
    if (gem === 'MCD_DAI') {
      vaults.push({
        symbol: 'DAI',
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

      vaults.push({
        symbol: gem === 'ETH' ? 'WETH' : gem,
        gem: mainnetAddresses[gem],
        ilk,
        join: mainnetAddresses[join],
      })
    }
  }

  return vaults
}
