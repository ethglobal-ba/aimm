# Integration Example

This document shows how to integrate the `@workspace/indexer-hooks` package into your frontend or extension apps.

## Installation

Since this is a workspace package, it's automatically available. Just add it to your app's package.json:

```json
{
  "dependencies": {
    "@workspace/indexer-hooks": "workspace:*"
  }
}
```

## Method 1: Using the Schema Factory (Recommended)

```tsx
// In your app (e.g., apps/frontend/src/lib/indexer.ts)
import { createAimmHooks, createPonderClient } from '@workspace/indexer-hooks';

// Import the indexer schema - IMPORTANT: adjust path for your app
import * as schema from '../../../apps/indexer/ponder.schema';

// Create the client
const ponderClient = createPonderClient('http://localhost:42069', schema);

// Create typed hooks
const {
  useMarkets,
  useMarket,
  useMarketPriceUpdates,
  useLatestMarketPrices,
  useMarketStats,
  useWorkflowResults,
  // ... all other hooks
} = createAimmHooks(schema);

export {
  ponderClient,
  useMarkets,
  useMarket,
  useMarketPriceUpdates,
  useLatestMarketPrices,
  useMarketStats,
  useWorkflowResults,
  schema,
};
```

Then in your components:

```tsx
// apps/frontend/src/components/MarketList.tsx
import React from 'react';
import { useMarkets, getStatusName, formatPrice } from '../lib/indexer';

export function MarketList() {
  const { data: markets, isLoading, error } = useMarkets();

  if (isLoading) return <div>Loading markets...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Markets ({markets?.length})</h2>
      {markets?.map((market) => (
        <div key={market.id} className="border p-4 rounded">
          <h3>{market.marketName}</h3>
          <p>Platform: {market.platform}</p>
          <p>Status: {getStatusName(market.status)}</p>
          <p>Option A: {market.optionAText}</p>
          <p>Option B: {market.optionBText}</p>
        </div>
      ))}
    </div>
  );
}
```

## Method 2: Using the Provider Approach

```tsx
// apps/frontend/src/App.tsx
import React from 'react';
import { AimmIndexerProvider } from '@workspace/indexer-hooks';
import * as schema from '../../apps/indexer/ponder.schema';
import { MarketDashboard } from './components/MarketDashboard';

function App() {
  return (
    <AimmIndexerProvider
      config={{
        indexerUrl: 'http://localhost:42069',
        schema: schema,
      }}
    >
      <div className="App">
        <MarketDashboard />
      </div>
    </AimmIndexerProvider>
  );
}

export default App;
```

Then use the hooks directly in components:

```tsx
// apps/frontend/src/components/MarketDashboard.tsx
import React from 'react';
import { usePonderQuery } from '@workspace/indexer-hooks';
import { schema, eq, desc } from '../lib/indexer';

function MarketDashboard() {
  // You can use the pre-built hooks or create custom queries
  const { data: recentActivity } = usePonderQuery({
    queryFn: async (db) => {
      const recentPrices = await db
        .select()
        .from(schema.priceUpdates)
        .orderBy(desc(schema.priceUpdates.timestamp))
        .limit(10);

      return recentPrices;
    },
    live: true,
  });

  return (
    <div>
      <h1>Market Dashboard</h1>
      {/* Your dashboard content */}
    </div>
  );
}

export default MarketDashboard;
```

## Available Hooks

The package provides these pre-built hooks:

- `useMarkets()` - Get all markets
- `useMarket(marketId)` - Get a specific market
- `useMarketsByPlatform(platform)` - Filter markets by platform
- `useMarketsByStatus(status)` - Filter markets by status
- `useMarketPriceUpdates(marketId, type?)` - Get price history
- `useLatestMarketPrices(marketId)` - Get latest prices
- `useMarketStatusChanges(marketId)` - Get status change history
- `useMarketConfigUpdates(marketId)` - Get config change history
- `useWorkflowResults()` - Get workflow execution results
- `useLatestWorkflowResult()` - Get the latest result
- `useDefaultConfigUpdates()` - Get default config changes
- `useLatestDefaultConfig()` - Get current default config
- `useOwnershipTransfers()` - Get ownership change history
- `useMarketStats()` - Get overall statistics

## Available Utilities

The package also provides utility functions:

```tsx
import {
  formatPrice,
  formatTimestamp,
  formatTimeAgo,
  getStatusName,
  MarketStatus,
  calculatePriceChange,
  calculateSpread,
  filterMarkets,
  shortenAddress,
} from '@workspace/indexer-hooks';

// Format a bigint price
const displayPrice = formatPrice(123456n); // "0.123456"

// Format timestamps
const timeAgo = formatTimeAgo(1640995200n); // "2 hours ago"

// Get status names
const statusName = getStatusName(MarketStatus.Active); // "Active"

// Calculate price changes
const changePercent = calculatePriceChange(100n, 110n); // 10%
```

## TypeScript Support

The package is fully typed and will provide IntelliSense and type safety:

```tsx
import type {
  MarketWithStatus,
  PriceData,
  ActivityItem,
  MarketStats,
  QueryOptions
} from '@workspace/indexer-hooks';

// All hooks return properly typed data
const { data: markets } = useMarkets(); // markets: MarketWithStatus[]
const { data: prices } = useMarketPriceUpdates('market-1'); // prices: PriceData[]
```

## Configuration Options

All hooks accept optional configuration:

```tsx
// Disable live updates
const { data: markets } = useMarkets({ live: false });

// Limit results
const { data: prices } = useMarketPriceUpdates('market-1', 'external', {
  limit: 20,
  live: true,
});
```