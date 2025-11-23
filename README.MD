# AIMM

## Components

- `apps/aimm-agent`: Stateful prediction market research agent that analyzes markets and generates orderbook recommendations using LangGraph.
- `apps/aimm2`: (ARTIFACT) Prediction market research agent that analyzes markets and generates orderbook recommendations using LangChain.
- `apps/break-glass`: (ARTIFACT) Break glass agent that can be used to manually intervene in the market.
- `apps/cre-kalshi-price-fetcher`: CRE project that fetches prices from Kalshi and writes them to the blockchain.
- `apps/cre-limitless-price-fetcher`: CRE project that fetches prices from Limitless and writes them to the blockchain.
- `apps/cre-trumpfun-price-fetcher`: CRE project that fetches prices from TrumpFun and writes them to the blockchain.
- `apps/cre-kalshi-price-fetcher`: CRE project that fetches prices from Kalshi and writes them to the blockchain.
## Contract setup

Run `git submodule update --init` to install foundry dependencies.

Note: NPM is set up below because that's what Pyth says to do
If you need to recreate the contracts setup (NPM is set up because [that's what Pyth says to do](https://docs.pyth.network/price-feeds/core/use-real-time-data/pull-integration/evm#install-pyth-sdk)):

```bash
mkdir contracts
cd contracts
forge install OpenZeppelin/openzeppelin-contracts
forge install smartcontractkit/foundry-chainlink-toolkit --no-commit
bun init -y
bun install @pythnetwork/pyth-sdk-solidity
```

Then manually add this to `remappings.txt`:

```text
@pythnetwork/pyth-sdk-solidity/=node_modules/@pythnetwork/pyth-sdk-solidity
```

## Precommit hook

Husky precommit hook is set up to catch broken code, and to automatically lint + prettier files in case someone's Cursor instance isn't set up to autoformat on save.

Do the following for a one time disable if needed:

```bash
HUSKY=0 git commit -m "commit message"
```

## Deploy Agent to server

See [./reference/deploy-to-hetzner.sh](./reference/deploy-to-hetzner.sh) for a generic script that rsyncs pwd to a remote target, then cds to a directory on the target and runs docker compose commands to rebuild and relaunch

## Sample Haproxy 

See [./reference/haproxy.cfg](./reference/haproxy.cfg) for a sample haproxy reverse proxy config that points to a docker compose service. Can be fed to AI to adapt to our project. Check edits to config with `haproxy -f /etc/haproxy/haproxy.cfg -d`

## Acme.sh

Acme.sh commands against Namecheap (TODO: Can't remember which envvars need to be set for namecheap credentials)

```bash
cd ~/acme.sh
./acme.sh --issue --dns dns_namecheap -d "real-trump.fun" -d "*.real-trump.fun"
./.acme.sh/acme.sh --deploy -d oh-fuck-did-someone-see-this.com --deploy-hook haproxy
```

## Supabase

Generate types:

```
npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID --schema public > ./src/types/__generated__/database.types.ts
```

## Wagmi TS type generation from Foundry project

See [./reference/generate-contract-types.sh](./reference/generate-contract-types.sh) for a script that runs against a foundry project, generates TS types w/ wagmi, and then copies the ABI + TS types to relevant directories in the project

## Venice

See [./reference/venice.ts](./reference/venice.ts) for example TS code that hits Venice. Can be translated to Python w/ AI

Venice specific parameters (not OpenAI compatible), such as enabling web search and web scraping, can be passed in as kwargs to ChatOpenAI in LangChain, passed in the body in REST API call to /chat/completions, or can be specified in the model name using [model feature suffix](https://docs.venice.ai/api-reference/endpoint/chat/model_feature_suffix)

## Signature Auth

The CRE will need to hit our Flask REST API to trigger a new fair price fetch. This route should be protected by signature auth to ensure only the capability DON is accessing it. See [./reference/signature-auth.ts](./reference/signature-auth.ts) for TS implementation of this feature that can be translated to Python w/ AI
