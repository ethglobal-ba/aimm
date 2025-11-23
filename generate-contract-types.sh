#!/bin/bash
set -e  # Exit on any error

# Configuration variables (script runs from project root)
CONTRACT_TYPES_FILE_INDEXER="apps/indexer/src/contract.types.ts"
CONTRACT_TYPES_FILE_SCRIPTS="scripts/src/contract.types.ts" #Don't want to add scripts to workspace this late in project
CONTRACT_TYPES_FILE_CRE_KALSHI_PRICE_FETCHER="apps/cre-kalshi-price-fetcher/cre-price-fetch/contract.types.ts"
CONTRACT_TYPES_FILE_CRE_FAIR_PRICE_FETCHER="apps/cre-fair-price-updater/fair-price-updater/contract.types.ts"
CONTRACT_TYPES_BREAK_GLASS="apps/break-glass/contract.types.ts"

# Contract types generation
echo "🔨 Building contracts and generating types..."
cd contracts/

# Build contracts first
echo "Building contracts..."
forge build

# Create temporary types directory
mkdir -p types

# Generate types using wagmi CLI (use bunx to find local installation)
echo "Generating contract types..."
bunx @wagmi/cli generate

# Move contract types to common package (wagmi creates types/generated.ts)
echo "Copying contract types to contract type files..."
cp types/generated.ts "../$CONTRACT_TYPES_FILE_INDEXER"
cp types/generated.ts "../$CONTRACT_TYPES_FILE_SCRIPTS"
cp types/generated.ts "../$CONTRACT_TYPES_FILE_CRE_KALSHI_PRICE_FETCHER"
cp types/generated.ts "../$CONTRACT_TYPES_FILE_CRE_FAIR_PRICE_FETCHER"
cp types/generated.ts "../$CONTRACT_TYPES_BREAK_GLASS"

# Copy ABI files to agent apps in case they need them (common json import is glitchy)
echo "Copying AIMM.json to agent apps..."
mkdir -p "../apps/aimm-agent/src/types"
cp out/AIMM.sol/AIMM.json "../apps/aimm-agent/src/AIMM.json"

# Clean up temporary directory from contracts
rm -rf types

echo "✨ All types generated and copied successfully!"
echo "   📄 Indexer contract types: $CONTRACT_TYPES_FILE_INDEXER"
echo "   📄 Scripts contract types: $CONTRACT_TYPES_FILE_SCRIPTS"
echo "   📄 Cre kalshi price fetcher contract types: $CONTRACT_TYPES_FILE_CRE_KALSHI_PRICE_FETCHER"
echo "   📄 Cre fair price fetcher contract types: $CONTRACT_TYPES_FILE_CRE_FAIR_PRICE_FETCHER"
echo "   📄 Break glass contract types: $CONTRACT_TYPES_BREAK_GLASS"
