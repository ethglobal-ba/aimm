#!/usr/bin/env python3
"""
Check what markets exist on the AIMM contract.
"""

import os
import json
import sys
from web3 import Web3
from dotenv import load_dotenv

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

CONTRACT_ADDRESS = os.getenv(
    "CONTRACT_ADDRESS", "0x64F65c2366BEFC2540c9312A794f0DAb5c3952F4"
)
RPC_URL = os.getenv("RPC_URL", "https://sepolia.base.org")


def load_abi():
    """Load contract ABI"""
    abi_path = os.path.join(os.path.dirname(__file__), "src", "types", "AIMM.json")
    with open(abi_path, "r") as f:
        return json.load(f).get("abi", [])


def main():
    print("=" * 80)
    print("CHECKING MARKETS ON CONTRACT")
    print("=" * 80)
    print(f"Contract: {CONTRACT_ADDRESS}")
    print(f"RPC: {RPC_URL}\n")

    # Connect to Web3
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    if not w3.is_connected():
        print("❌ Failed to connect to RPC")
        return

    print("✅ Connected to blockchain")

    # Load contract
    abi = load_abi()
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=abi
    )

    # Get all market IDs
    try:
        print("\nCalling getAllMarketIds()...")
        market_ids = contract.functions.getAllMarketIds().call()

        print(f"\n✅ Found {len(market_ids)} markets on contract:\n")

        if not market_ids:
            print("⚠️  No markets onboarded yet!")
            print("\nTo onboard a market, you need to call onboardMarket() first.")
            return

        for i, market_id in enumerate(market_ids, 1):
            print(f"{i}. {market_id}")

            # Get market details
            try:
                market = contract.functions.getMarket(market_id).call()
                print(f"   Status: {market[12]}")  # status is the last field
            except Exception as e:
                print(f"   Error getting details: {e}")

        print("\n" + "=" * 80)
        print(f"Total: {len(market_ids)} markets")
        print("=" * 80)

    except Exception as e:
        print(f"❌ Error calling getAllMarketIds(): {e}")
        print("\nThis might mean:")
        print("  1. The contract doesn't have this function")
        print("  2. You're connected to the wrong contract")
        print("  3. The contract address in .env is incorrect")


if __name__ == "__main__":
    main()
