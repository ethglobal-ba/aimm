# @aimm/indexer-hooks

Type-safe React hooks and client utilities for querying the AIMM indexer database.

## Installation

```bash
pnpm add @aimm/indexer-hooks
```

## Peer Dependencies

Make sure you have the following peer dependencies installed:

```bash
pnpm add @ponder/client @ponder/react @tanstack/react-query react
```

## Setup

### Provider Setup

Wrap your app with the `AimmIndexerProvider`:

```tsx
import { AimmIndexerProvider } from '@aimm/indexer-hooks';

function App() {
  return (
    <AimmIndexerProvider
      config={{
        indexerUrl: 'http://localhost:42069', // Optional, defaults to localhost:42069
      }}
    >
      <YourAppComponents />
    </AimmIndexerProvider>
  );
}
```

### Advanced Provider Setup

```tsx
import { AimmIndexerProvider } from '@aimm/indexer-hooks';
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      refetchInterval: 60 * 1000, // Refetch every minute
    },
  },
});

function App() {
  return (
    <AimmIndexerProvider
      config={{
        indexerUrl: process.env.REACT_APP_INDEXER_URL,
        queryClient,
      }}
    >
      <YourAppComponents />
    </AimmIndexerProvider>
  );
}
```

## Hooks

### Market Hooks

#### `useMarkets(options?)`

Get all markets with live updates:

```tsx
import { useMarkets } from '@aimm/indexer-hooks';

function MarketList() {
  const { data: markets, isLoading, error } = useMarkets();

  if (isLoading) return <div>Loading markets...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {markets?.map((market) => (
        <li key={market.id}>
          {market.marketName} - {market.platform}
        </li>
      ))}
    </ul>
  );
}
```

#### `useMarket(marketId, options?)`

Get a specific market:

```tsx
import { useMarket, getStatusName } from '@aimm/indexer-hooks';

function MarketDetail({ marketId }: { marketId: string }) {
  const { data: market, isLoading } = useMarket(marketId);

  if (isLoading) return <div>Loading...</div>;
  if (!market?.[0]) return <div>Market not found</div>;

  const marketData = market[0];

  return (
    <div>
      <h1>{marketData.marketName}</h1>
      <p>Platform: {marketData.platform}</p>
      <p>Status: {getStatusName(marketData.status)}</p>
      <p>Option A: {marketData.optionAText}</p>
      <p>Option B: {marketData.optionBText}</p>
    </div>
  );
}
```

#### `useMarketsByPlatform(platform, options?)`

Get markets for a specific platform:

```tsx
import { useMarketsByPlatform } from '@aimm/indexer-hooks';

function KalshiMarkets() {
  const { data: markets } = useMarketsByPlatform('kalshi');

  return (
    <div>
      <h2>Kalshi Markets</h2>
      {markets?.map((market) => (
        <div key={market.id}>{market.marketName}</div>
      ))}
    </div>
  );
}
```

#### `useMarketsByStatus(status, options?)`

Get markets by status:

```tsx
import { useMarketsByStatus, MarketStatus } from '@aimm/indexer-hooks';

function ActiveMarkets() {
  const { data: activeMarkets } = useMarketsByStatus(MarketStatus.Active);

  return (
    <div>
      <h2>Active Markets ({activeMarkets?.length})</h2>
      {activeMarkets?.map((market) => (
        <div key={market.id}>{market.marketName}</div>
      ))}
    </div>
  );
}
```

### Price Hooks

#### `useMarketPriceUpdates(marketId, type?, options?)`

Get price updates for a market:

```tsx
import { useMarketPriceUpdates, formatPrice, formatTimeAgo } from '@aimm/indexer-hooks';

function PriceHistory({ marketId }: { marketId: string }) {
  const { data: prices } = useMarketPriceUpdates(marketId, 'external', { limit: 10 });

  return (
    <div>
      <h3>Price History</h3>
      {prices?.map((price) => (
        <div key={price.id}>
          <span>A: {formatPrice(price.optionAPrice)}</span>
          <span>B: {formatPrice(price.optionBPrice)}</span>
          <span>{formatTimeAgo(price.timestamp)}</span>
        </div>
      ))}
    </div>
  );
}
```

#### `useLatestMarketPrices(marketId, options?)`

Get the latest prices for a market:

```tsx
import { useLatestMarketPrices, getLatestPrices, formatPrice } from '@aimm/indexer-hooks';

function CurrentPrices({ marketId }: { marketId: string }) {
  const { data: priceUpdates } = useLatestMarketPrices(marketId);

  const latestPrices = getLatestPrices(priceUpdates || []);

  return (
    <div>
      {latestPrices.external && (
        <div>
          External: A={formatPrice(latestPrices.external.optionAPrice)}
          B={formatPrice(latestPrices.external.optionBPrice)}
        </div>
      )}
      {latestPrices.fair && (
        <div>
          Fair: A={formatPrice(latestPrices.fair.optionAPrice)}
          B={formatPrice(latestPrices.fair.optionBPrice)}
        </div>
      )}
    </div>
  );
}
```

### Activity Hooks

#### `useRecentActivity(options?)`

Get recent activity across all data:

```tsx
import { useRecentActivity, formatTimeAgo } from '@aimm/indexer-hooks';

function ActivityFeed() {
  const { data: activities } = useRecentActivity({ limit: 50 });

  return (
    <div>
      <h2>Recent Activity</h2>
      {activities?.map((activity, index) => (
        <div key={index}>
          <span>{activity.type}</span>
          {activity.marketId && <span>Market: {activity.marketId}</span>}
          <span>{formatTimeAgo(activity.timestamp)}</span>
        </div>
      ))}
    </div>
  );
}
```

#### `useWorkflowResults(options?)`

Get workflow execution results:

```tsx
import { useWorkflowResults, formatTimeAgo } from '@aimm/indexer-hooks';

function WorkflowResults() {
  const { data: results } = useWorkflowResults({ limit: 20 });

  return (
    <div>
      <h2>Workflow Results</h2>
      {results?.map((result) => (
        <div key={result.id}>
          <span>Result ID: {result.resultId.toString()}</span>
          <span>Value: {result.finalResult.toString()}</span>
          <span>{formatTimeAgo(result.timestamp)}</span>
        </div>
      ))}
    </div>
  );
}
```

### Statistics Hooks

#### `useMarketStats(options?)`

Get overall market statistics:

```tsx
import { useMarketStats } from '@aimm/indexer-hooks';

function DashboardStats() {
  const { data: stats, isLoading } = useMarketStats();

  if (isLoading) return <div>Loading stats...</div>;

  return (
    <div>
      <div>Total Markets: {stats?.totalMarkets}</div>
      <div>Active Markets: {stats?.activeMarkets}</div>
      <div>Price Updates: {stats?.totalPriceUpdates}</div>
      <div>Workflow Results: {stats?.totalWorkflowResults}</div>
    </div>
  );
}
```

## Utilities

### Formatting Utils

```tsx
import {
  formatPrice,
  formatTimestamp,
  formatTimeAgo,
  getStatusName,
  MarketStatus
} from '@aimm/indexer-hooks';

// Format bigint price
const displayPrice = formatPrice(123456n, 6); // "0.123456"

// Format timestamps
const fullDate = formatTimestamp(1640995200n); // "12/31/2021, 4:00:00 PM"
const timeAgo = formatTimeAgo(1640995200n); // "2 hours ago"

// Get status name
const statusName = getStatusName(MarketStatus.Active); // "Active"
```

### Price Calculations

```tsx
import {
  calculatePriceChange,
  calculateSpread,
  calculateImpliedProbability
} from '@aimm/indexer-hooks';

// Calculate price change percentage
const change = calculatePriceChange(100n, 110n); // 10%

// Calculate spread between options
const spread = calculateSpread(6000n, 4000n); // 2000n

// Calculate implied probability
const probability = calculateImpliedProbability(6000n, 10000n); // 60%
```

## Direct Client Usage

For more complex queries, you can use the client directly:

```tsx
import { usePonderClient, schema, eq, desc } from '@aimm/indexer-hooks';

function CustomQuery() {
  const client = usePonderClient();

  const { data } = usePonderQuery({
    queryFn: async (db) => {
      return await db
        .select({
          market: schema.markets,
          latestPrice: schema.priceUpdates,
        })
        .from(schema.markets)
        .leftJoin(
          schema.priceUpdates,
          eq(schema.markets.id, schema.priceUpdates.marketId)
        )
        .orderBy(desc(schema.priceUpdates.timestamp))
        .limit(10);
    },
  });

  return <div>{/* Render custom query results */}</div>;
}
```

## Types

The package exports all necessary TypeScript types:

```tsx
import type {
  MarketWithStatus,
  PriceData,
  ActivityItem,
  MarketStats,
  QueryOptions
} from '@aimm/indexer-hooks';
```

## Configuration Options

### Query Options

Most hooks accept an `options` parameter:

- `live?: boolean` - Whether to subscribe to live updates (default: true)
- `limit?: number` - Limit the number of results returned

### Provider Configuration

- `indexerUrl?: string` - URL of the Ponder indexer server
- `queryClient?: QueryClient` - Custom TanStack Query client instance

## Error Handling

All hooks return standard TanStack Query result objects with error handling:

```tsx
function MyComponent() {
  const { data, isLoading, error, isError } = useMarkets();

  if (isError) {
    console.error('Failed to fetch markets:', error);
    return <div>Failed to load markets</div>;
  }

  // ... rest of component
}
```