#!/bin/bash
set -e  # Exit on any error

# Configuration variables (script runs from project root)
CONTRACT_TYPES_FILE="packages/common/src/types/__generated__/contract.types.ts"
CONTRACT_TYPES_FILE_INDEXER="apps/indexer/src/contract.types.ts"
CONTRACT_TYPES_FILE_SCRIPTS="scripts/src/contract.types.ts" #Don't want to add scripts to workspace this late in project
CONTRACT_TYPES_FILE_CRE_WORKFLOWS="apps/cre-workflows/cre-price-fetch/contract.types.ts"
CONTRACT_TYPES_BREAK_GLASS="apps/break-glass/contract.types.ts"
CONTRACT_TYPES_AIMM_SDK="packages/aimm-sdk/src/contract/contract.types.ts"

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
echo "Moving contract types to $CONTRACT_TYPES_FILE..."
mkdir -p ../packages/common/src/types/__generated__/
cp types/generated.ts "../$CONTRACT_TYPES_FILE"
cp types/generated.ts "../$CONTRACT_TYPES_FILE_INDEXER"
cp types/generated.ts "../$CONTRACT_TYPES_FILE_SCRIPTS"
cp types/generated.ts "../$CONTRACT_TYPES_FILE_CRE_WORKFLOWS"
cp types/generated.ts "../$CONTRACT_TYPES_BREAK_GLASS"
cp types/generated.ts "../$CONTRACT_TYPES_AIMM_SDK"

# Copy ABI files to agent apps in case they need them (common json import is glitchy)
echo "Copying AIMM.json to agent apps..."
mkdir -p "../apps/aimm-agent/src/types/__generated__"
cp out/AIMM.sol/AIMM.json "../apps/aimm-agent/src/types/__generated__/AIMM.json"

# Clean up temporary directory from contracts
rm -rf types

echo "✨ All types generated and copied successfully!"
echo "   📄 Contract types: $CONTRACT_TYPES_FILE"
echo "   📄 Indexer contract types: $CONTRACT_TYPES_FILE_INDEXER"
echo "   📄 Scripts contract types: $CONTRACT_TYPES_FILE_SCRIPTS"
echo "   📄 Cre workflows contract types: $CONTRACT_TYPES_FILE_CRE_WORKFLOWS"
echo "   📄 Break glass contract types: $CONTRACT_TYPES_BREAK_GLASS"
echo "   📄 AIMM SDK contract types: $CONTRACT_TYPES_AIMM_SDK"