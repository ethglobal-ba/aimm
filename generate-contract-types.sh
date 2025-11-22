#!/bin/bash
set -e  # Exit on any error

# Configuration variables (script runs from project root)
CONTRACT_TYPES_FILE="packages/common/src/types/__generated__/contract.types.ts"
CONTRACT_TYPES_FILE_INDEXER="apps/indexer/src/contract.types.ts"


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

# # Copy ABI files to apps in case they need them (common json import is glitchy)
# echo "Copying TlonToken.json and TokenFactory.json to apps..."
# mkdir -p "../apps/project-discovery-agent/src/types/__generated__"
# mkdir -p "../apps/project-scoring-agent/src/types/__generated__"
# mkdir -p "../apps/backend/src/types/__generated__"
# mkdir -p "../apps/frontend/src/types/__generated__"
# mkdir -p "../apps/indexer/abis"
# cp out/TlonToken.sol/TlonToken.json "../apps/project-discovery-agent/src/types/__generated__/TlonToken.json"
# cp out/TlonToken.sol/TlonToken.json "../apps/project-scoring-agent/src/types/__generated__/TlonToken.json"
# cp out/TlonToken.sol/TlonToken.json "../apps/backend/src/types/__generated__/TlonToken.json"
# cp out/TlonToken.sol/TlonToken.json "../apps/frontend/src/types/__generated__/TlonToken.json"
# cp out/TlonToken.sol/TlonToken.json "../apps/indexer/abis/TlonToken.json"
# cp out/TokenFactory.sol/TokenFactory.json "../apps/project-discovery-agent/src/types/__generated__/TokenFactory.json"
# cp out/TokenFactory.sol/TokenFactory.json "../apps/project-scoring-agent/src/types/__generated__/TokenFactory.json"
# cp out/TokenFactory.sol/TokenFactory.json "../apps/backend/src/types/__generated__/TokenFactory.json"
# cp out/TokenFactory.sol/TokenFactory.json "../apps/frontend/src/types/__generated__/TokenFactory.json"
# cp out/TokenFactory.sol/TokenFactory.json "../apps/indexer/abis/TokenFactory.json"

# Clean up temporary directory from contracts
rm -rf types

echo "✨ All types generated and copied successfully!"
echo "   📄 Contract types: $CONTRACT_TYPES_FILE"
