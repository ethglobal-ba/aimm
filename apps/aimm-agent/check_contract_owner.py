#!/usr/bin/env python3
"""
Check contract owner and permissions.
"""

import os
import json
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

CONTRACT_ADDRESS = os.getenv(
    "CONTRACT_ADDRESS", "0x64F65c2366BEFC2540c9312A794f0DAb5c3952F4"
)
RPC_URL = os.getenv("RPC_URL", "https://sepolia.base.org")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

def load_abi():
    """Load contract ABI"""
    abi_path = os.path.join(os.path.dirname(__file__), "src", "types", "AIMM.json")
    with open(abi_path, 'r') as f:
        return json.load(f).get('abi', [])

def main():
    print("="*80)
    print("CHECKING CONTRACT PERMISSIONS")
    print("="*80)

    # Connect to Web3
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    account = w3.eth.account.from_key(PRIVATE_KEY)

    print(f"Your Address: {account.address}")
    print(f"Contract: {CONTRACT_ADDRESS}")
    print(f"RPC: {RPC_URL}\n")

    # Load contract
    abi = load_abi()
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(CONTRACT_ADDRESS),
        abi=abi
    )

    # Check owner
    try:
        owner = contract.functions.owner().call()
        print(f"Contract Owner: {owner}")
        print(f"Your address: {account.address}")
        print(f"Are you the owner? {owner.lower() == account.address.lower()}\n")
    except Exception as e:
        print(f"Error getting owner: {e}\n")

    # Try to get market status
    try:
        print("Checking TEST-MARKET-001...")
        market = contract.functions.externalMarkets("TEST-MARKET-001").call()
        print(f"Market Status: {market[12]}")  # status is last field
        print(f"Platform: {market[0]}")
        print(f"Market Name: {market[1]}")
        print(f"Option A Current Price: {market[4]}")
        print(f"Option B Current Price: {market[5]}")
        print(f"Option A Fair Price: {market[6]}")
        print(f"Option B Fair Price: {market[7]}")
        print()
    except Exception as e:
        print(f"Error getting market: {e}\n")

    print("="*80)

if __name__ == "__main__":
    main()
