#!/bin/bash
set -e  # Exit on any error

# Configuration variables (script runs from project root)
CONTRACT_TYPES_FILE="packages/common/src/types/__generated__/contract.types.ts"
SUPABASE_TYPES_FILE="packages/common/src/types/__generated__/supabase.types.ts"
INDEXER_ABI_FILE="apps/indexer/abis/AIMMABI.json"
AGENT_ABI_FILE="apps/agent/src/types/AIMM.json"

echo "🔨 Building AIMM contracts and generating ABIs..."

# Build contracts first (contracts are in root /contracts directory)
echo "Building contracts..."
cd contracts
forge build

# Generate ABI for AIMM contract using jq from compiled artifacts
echo "Generating AIMM ABI..."
jq '.abi' out/AIMM.sol/AIMM.json > "../$INDEXER_ABI_FILE"

# Copy ABI to agent directory as well
echo "Copying AIMM ABI to agent..."
mkdir -p "../apps/agent/src/types"
cp "../$INDEXER_ABI_FILE" "../$AGENT_ABI_FILE"

# Create TypeScript ABI for indexer
echo "Creating TypeScript ABI file..."
cat > "../apps/indexer/abis/AIMMABI.ts" << 'EOF'
export const AIMMABI =
EOF

# Convert JSON to TypeScript format and append
jq '.abi' out/AIMM.sol/AIMM.json | sed '$s/$/\] as const;/' >> "../apps/indexer/abis/AIMMABI.ts"

# Return to project root
cd ../

# Create TypeScript interface file for type safety
echo "Creating TypeScript interface..."
mkdir -p "packages/common/src/types/__generated__"
cat > "$CONTRACT_TYPES_FILE" << 'EOF'
// Auto-generated contract types for AIMM
import type { Address } from 'viem'

export interface AIMMContract {
  address: Address
  abi: typeof import('../../../apps/indexer/abis/AIMMABI').AIMMABI
}

export interface MarketData {
  marketId: string
  externalId: string
  marketName: string
  optionAText: string
  optionBText: string
  optionACurrentExternalPrice: bigint
  optionBCurrentExternalPrice: bigint
  optionACurrentFairPrice: bigint
  optionBCurrentFairPrice: bigint
  lastPriceUpdate: bigint
  minPriceDifference: bigint
  maxSpendAmount: bigint
  slippageToleranceBps: bigint
  status: number // MarketStatus enum
}

export interface WorkflowResult {
  workflowName: string
  marketId: string
  optionAPrice: bigint
  optionBPrice: bigint
  offchainValue: bigint
  onchainValue: bigint
  finalResult: bigint
}

// Contract deployment info from broadcast
export const AIMM_DEPLOYMENTS = {
  baseSepolia: {
    address: '0x6eB00e2CEA8F91D9C473bF15a466Dc938EADc7dE' as Address,
    blockNumber: 34015526n, // 0x206c526 in decimal
    chainId: 84532
  }
} as const

export type AIMMEvents =
  | 'ResultUpdated'
  | 'MarketOnboarded'
  | 'MarketConfigUpdated'
  | 'CurrentPricesUpdated'
  | 'FairPricesUpdated'
  | 'MarketStatusChanged'
  | 'DefaultConfigUpdated'
  | 'OwnershipTransferred'
EOF

# Skip Supabase types if no project ID provided
if [ -n "$SUPABASE_PROJECT_ID" ]; then
    echo "📊 Generating Supabase types..."
    echo "Generating Supabase types for project: $SUPABASE_PROJECT_ID"
    bunx supabase gen types typescript --project-id="$SUPABASE_PROJECT_ID" > "$SUPABASE_TYPES_FILE"
    SUPABASE_STATUS="✅ Generated"
else
    echo "⏭️  Skipping Supabase types generation (no SUPABASE_PROJECT_ID set)"
    SUPABASE_STATUS="⏭️  Skipped"
fi

echo ""
echo "✨ AIMM contract types and ABIs generated successfully!"
echo "   📄 Indexer ABI:     $INDEXER_ABI_FILE"
echo "   📄 Indexer TS ABI:  apps/indexer/abis/AIMMABI.ts"
echo "   📄 Agent ABI:       $AGENT_ABI_FILE"
echo "   📄 Contract types:  $CONTRACT_TYPES_FILE"
echo "   📄 Supabase types: $SUPABASE_STATUS"
echo ""
echo "🎯 Ready for:"
echo "   • Ponder indexer (uses JSON ABI)"
echo "   • TypeScript type safety"
echo "   • Agent integration"
