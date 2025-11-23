# AIMM

Automated market making agent for prediction markets. Built on Base, powered by Chainlink, Pyth, and Limitless.

## Components

- [`apps/aimm-agent`](./apps/aimm-agent): Stateful prediction market research agent that analyzes markets for fair prices and generates orderbook recommendations using LangGraph. Also our x402 backend (in conjunction w/ Next.js REST API). Pyth and Limitless (Base) integrations here
- [`apps/break-glass`](./apps/break-glass): Our plan B when things happen, was unused
- [`apps/cre-kalshi-price-fetcher`](./apps/cre-kalshi-price-fetcher): Fully custom Chainlink Runtime Environment project that fetches prices from Kalshi and writes them to the blockchain to inform the price balancing automation trigger. Everything Chainlink here, core of orchestration.
- [`indexer`](./apps/indexer): Ponder indexer that stores event data and collates updates into clean entities for the frontend
- [`web`](./apps/web): The whole frontend. Made with React, Tailwind, Shadcn, Lucid, Viem, Hono, and Pusher.
- [`scripts`](./scripts): Scripts for preloading markets, fetching prices, etc. Also our chainlink trigger script.
- [`contracts`](./contracts): Foundry contracts for the AIMM (application) contract and the PythOracle contract that informs price market research
- [`packages/eslint-config`](./packages/eslint-config), [`packages/typescript-config`](./packages/typescript-config): Shared ESLint and TypeScript config for the project
