# Porfolio Adapters

## Getting listed

Submit a PR with the following file in `projects/<project>/index.ts`:

```
import type { GetAccountsReturns, GetEventsReturns, GetPorfolioChainParam, GetPorfolioReturns } from '../../adapterTypes'

export async function getEvents(): Promise<GetEventsReturns> {
  return []
}

export async function getAccounts(): Promise<GetAccountsReturns> {
  return []
}

export async function getPorfolio(chains: GetPorfolioChainParam, account: string): Promise<GetPorfolioReturns> {
  return []
}
```

## Testing adapters

```
yarn test-portfolio <project> <user address>
```

## Changing RPC providers

If you want to change RPC providers because you need archive node access or because the default ones don't work well enough you can do so by creating an `.env` file and filling it with the env variables to overwrite:

```
ETHEREUM_RPC="..."
BSC_RPC="..."
POLYGON_RPC="..."
FANTOM_RPC="..."
ARBITRUM_RPC="..."
OPTIMISM_RPC="..."
XDAI_RPC="..."
HARMONY_RPC="..."
```

The name of each rpc is `{CHAIN-NAME}_RPC`, and the name we use for each chain can be found [here](https://github.com/DefiLlama/defillama-sdk/blob/master/src/general.ts#L33)
