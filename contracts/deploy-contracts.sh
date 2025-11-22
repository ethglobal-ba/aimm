#!/bin/bash

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting AIMM contract deployment to Base Sepolia...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

# Source environment variables
source .env

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}❌ Error: PRIVATE_KEY not found in .env file${NC}"
    exit 1
fi

# Get the old contract address from .env
OLD_ADDRESS=""
if [ -n "$AIMM_ADDRESS" ]; then
    OLD_ADDRESS="$AIMM_ADDRESS"
    echo -e "${YELLOW}📋 Current AIMM address: $OLD_ADDRESS${NC}"
fi

echo -e "${YELLOW}📦 Deploying contract...${NC}"

# Deploy the contract and capture output
DEPLOY_OUTPUT=$(forge script script/DeployAIMM.s.sol --rpc-url base_sepolia --private-key $PRIVATE_KEY --broadcast --verify 2>&1)

# Check if deployment was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

echo -e "${GREEN}✅ Deployment successful!${NC}"

# Extract the new contract address from the output
# Look for "AIMM deployed at:" pattern
NEW_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -i "AIMM deployed at:" | sed -n 's/.*AIMM deployed at: *\(0x[a-fA-F0-9]\{40\}\).*/\1/p' | head -1)

if [ -z "$NEW_ADDRESS" ]; then
    # Alternative pattern: look for contract creation logs
    NEW_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -o "0x[a-fA-F0-9]\{40\}" | head -1)
fi

if [ -z "$NEW_ADDRESS" ]; then
    echo -e "${RED}❌ Error: Could not extract contract address from deployment output${NC}"
    echo "Deployment output:"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

echo -e "${GREEN}📍 New AIMM contract deployed at: $NEW_ADDRESS${NC}"

# Update the .env file with the new contract address
if [ -n "$OLD_ADDRESS" ]; then
    echo -e "${YELLOW}🔄 Updating .env file...${NC}"
    # Use sed to replace the old address with the new one
    sed -i.bak "s/$OLD_ADDRESS/$NEW_ADDRESS/g" .env
    echo -e "${GREEN}✅ Updated AIMM_ADDRESS in .env file${NC}"
    echo -e "${YELLOW}📝 Old address: $OLD_ADDRESS${NC}"
    echo -e "${GREEN}📝 New address: $NEW_ADDRESS${NC}"
else
    echo -e "${YELLOW}🆕 Adding AIMM_ADDRESS to .env file...${NC}"
    # If AIMM_ADDRESS doesn't exist, add it
    if ! grep -q "AIMM_ADDRESS=" .env; then
        echo "AIMM_ADDRESS=$NEW_ADDRESS" >> .env
    else
        # Replace the existing line
        sed -i.bak "s/AIMM_ADDRESS=.*/AIMM_ADDRESS=$NEW_ADDRESS/" .env
    fi
    echo -e "${GREEN}✅ Added AIMM_ADDRESS to .env file${NC}"
fi

# Update other config files that might reference the old address
echo -e "${YELLOW}🔄 Updating configuration files...${NC}"

# Update CRE config files
CRE_STAGING_CONFIG="../apps/aimm/cre-price-fetch/config.staging.json"
CRE_PRODUCTION_CONFIG="../apps/aimm/cre-price-fetch/config.production.json"

if [ -f "$CRE_STAGING_CONFIG" ] && [ -n "$OLD_ADDRESS" ]; then
    echo -e "${YELLOW}   📄 Updating $CRE_STAGING_CONFIG...${NC}"
    sed -i.bak "s/$OLD_ADDRESS/$NEW_ADDRESS/g" "$CRE_STAGING_CONFIG"
    echo -e "${GREEN}   ✅ Updated staging config${NC}"
fi

if [ -f "$CRE_PRODUCTION_CONFIG" ] && [ -n "$OLD_ADDRESS" ]; then
    echo -e "${YELLOW}   📄 Updating $CRE_PRODUCTION_CONFIG...${NC}"
    sed -i.bak "s/$OLD_ADDRESS/$NEW_ADDRESS/g" "$CRE_PRODUCTION_CONFIG"
    echo -e "${GREEN}   ✅ Updated production config${NC}"
fi

# Clean up backup files
rm -f .env.bak
[ -f "$CRE_STAGING_CONFIG.bak" ] && rm -f "$CRE_STAGING_CONFIG.bak"
[ -f "$CRE_PRODUCTION_CONFIG.bak" ] && rm -f "$CRE_PRODUCTION_CONFIG.bak"

echo -e "${GREEN}🎉 Deployment and configuration update complete!${NC}"
echo -e "${GREEN}📍 AIMM Contract Address: $NEW_ADDRESS${NC}"
echo -e "${GREEN}🌐 Explorer: https://sepolia.basescan.org/address/$NEW_ADDRESS${NC}"

# Display summary
echo ""
echo -e "${YELLOW}📋 Deployment Summary:${NC}"
echo -e "   Contract: AIMM (Automated Intelligent Market Maker)"
echo -e "   Network: Base Sepolia"
echo -e "   Address: $NEW_ADDRESS"
if [ -n "$OLD_ADDRESS" ]; then
    echo -e "   Previous: $OLD_ADDRESS"
fi
echo -e "   Explorer: https://sepolia.basescan.org/address/$NEW_ADDRESS"