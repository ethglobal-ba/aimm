/**
 * Example of how consuming apps should use the indexer-hooks package
 *
 * This file is for reference only and shows the proper usage patterns.
 * Consuming apps should follow these patterns to get full type safety.
 */

import React from 'react';
import { AimmIndexerProvider, createAimmHooks } from '@aimm/indexer-hooks';
// Import the schema from your indexer
// import * as schema from '../../../apps/indexer/ponder.schema';

// Method 1: Using the Provider approach (recommended)
function AppWithProvider() {
  return (
    <AimmIndexerProvider
      config={{
        indexerUrl: 'http://localhost:42069',
        // schema: schema, // Pass the schema for full type safety
      }}
    >
      <MyComponents />
    </AimmIndexerProvider>
  );
}

// Method 2: Creating hooks with schema directly
// const aimmHooks = createAimmHooks(schema);
// const { useMarkets, useMarket, useMarketPriceUpdates } = aimmHooks;

function MyComponents() {
  // Using hooks inside provider context
  // const { data: markets } = useMarkets();

  return (
    <div>
      {/* Your components here */}
    </div>
  );
}

export default AppWithProvider;