#!/usr/bin/env python3
"""
Script to call the PythOracle contract using Hermes REST API data.
This script fetches price update data from Pyth's Hermes API and calls the updatePrice function on the deployed PythOracle contract.
"""

import os
import sys
import json
import requests
from web3 import Web3
from eth_account import Account
from pyth_price_client import PythClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration
PYTH_ORACLE_ADDRESS = "0x3E1D67CB6842165Aa0F27591fC89Ecb3244E55f5"
BASE_SEPOLIA_RPC_URL = "https://base-sepolia-rpc.publicnode.com"
HERMES_BASE_URL = "https://hermes.pyth.network"

# ETH/USD price feed ID for Pyth
ETH_USD_PRICE_FEED_ID = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"

# PythOracle contract ABI (simplified)
PYTH_ORACLE_ABI = [
    {
        "type": "function",
        "name": "updatePrice",
        "inputs": [
            {"name": "priceUpdate", "type": "bytes[]"},
            {"name": "priceFeedId", "type": "bytes32"}
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "event",
        "name": "PriceUpdated",
        "inputs": [
            {"indexed": True, "name": "priceFeedId", "type": "bytes32"},
            {"indexed": False, "name": "price", "type": "int64"},
            {"indexed": False, "name": "publishTime", "type": "uint256"}
        ]
    }
]

class PythOracleClient:
    def __init__(self, rpc_url: str, oracle_address: str, private_key: str = None):
        """Initialize the PythOracle client."""
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))

        if not self.w3.is_connected():
            raise Exception(f"Failed to connect to {rpc_url}")

        self.oracle_address = Web3.to_checksum_address(oracle_address)
        self.oracle_contract = self.w3.eth.contract(
            address=self.oracle_address,
            abi=PYTH_ORACLE_ABI
        )

        if private_key:
            self.account = Account.from_key(private_key)
        else:
            self.account = None

        self.pyth_client = PythClient()

        print(f"Connected to {rpc_url}")
        print(f"PythOracle contract: {self.oracle_address}")
        if self.account:
            print(f"Account: {self.account.address}")

    def get_price_update_data(self, price_feed_id: str) -> tuple[list, dict]:
        """Fetch price update data from Hermes API."""
        try:
            # Get the latest price update data from Hermes
            url = f"{HERMES_BASE_URL}/v2/updates/price/latest"
            params = {
                'ids[]': price_feed_id,
                'encoding': 'hex',
                'parsed': 'true'
            }

            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            if 'binary' not in data or 'parsed' not in data:
                raise Exception("Invalid response format from Hermes API")

            # Extract the binary data (price update bytes) and convert to bytes
            price_updates = [bytes.fromhex(update) for update in data['binary']['data']]
            parsed_data = data['parsed'][0] if data['parsed'] else {}

            print(f"✅ Fetched price update data for {price_feed_id}")
            if parsed_data and 'price' in parsed_data:
                price_info = parsed_data['price']
                price_value = int(price_info['price']) * (10 ** int(price_info['expo']))
                print(f"   Current price: ${price_value:.6f}")
                print(f"   Publish time: {price_info['publish_time']}")

            return price_updates, parsed_data

        except Exception as e:
            print(f"❌ Error fetching price update data: {e}")
            return [], {}

    def update_price(self, price_feed_id: str, gas_limit: int = 500000) -> str:
        """Update price on the PythOracle contract."""
        if not self.account:
            raise Exception("No private key provided for transaction signing")

        try:
            # Get price update data
            price_updates, parsed_data = self.get_price_update_data(price_feed_id)
            if not price_updates:
                raise Exception("Failed to get price update data")

            # Convert price_feed_id to bytes32
            feed_id_bytes32 = Web3.to_bytes(hexstr=price_feed_id)

            # Prepare transaction
            nonce = self.w3.eth.get_transaction_count(self.account.address)

            # Build transaction
            transaction = self.oracle_contract.functions.updatePrice(
                price_updates,
                feed_id_bytes32
            ).build_transaction({
                'from': self.account.address,
                'nonce': nonce,
                'gas': gas_limit,
                'gasPrice': self.w3.eth.gas_price,
                'value': 0  # No ETH value needed for this call
            })

            # Sign and send transaction
            signed_txn = self.account.sign_transaction(transaction)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)

            print(f"📤 Transaction sent: {tx_hash.hex()}")

            # Wait for confirmation
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

            if receipt.status == 1:
                print(f"✅ Transaction confirmed! Block: {receipt.blockNumber}")

                # Check for PriceUpdated events
                events = self.oracle_contract.events.PriceUpdated().process_receipt(receipt)
                for event in events:
                    print(f"🎉 PriceUpdated event emitted:")
                    print(f"   Feed ID: {event.args.priceFeedId.hex()}")
                    print(f"   Price: {event.args.price}")
                    print(f"   Publish Time: {event.args.publishTime}")

                return tx_hash.hex()
            else:
                print(f"❌ Transaction failed!")
                return None

        except Exception as e:
            print(f"❌ Error updating price: {e}")
            return None

    def demo_price_fetch(self, symbol: str = "ETH/USD"):
        """Demo: Just fetch and display price data without sending transaction."""
        print(f"\n🔍 Fetching price data for {symbol}...")

        # Find the price feed
        feed_info = self.pyth_client.get_price_by_symbol(symbol)
        if not feed_info:
            print(f"❌ Price feed for {symbol} not found")
            return

        feed_id = feed_info['feed_info']['id']
        print(f"📊 Found feed ID: {feed_id}")

        # Get price update data
        price_updates, parsed_data = self.get_price_update_data(feed_id)

        if parsed_data:
            print(f"✅ Successfully fetched price update data")
            print(f"📦 Price update data size: {len(price_updates)} bytes")
        else:
            print(f"❌ Failed to fetch price update data")

def main():
    """Main function to run the script."""
    print("🚀 PythOracle Contract Caller")
    print("=" * 50)

    # Check for environment variables
    private_key = os.getenv('PRIVATE_KEY')
    if not private_key and len(sys.argv) > 1 and sys.argv[1] != 'demo':
        print("❌ PRIVATE_KEY environment variable not set and not in demo mode")
        print("💡 Set PRIVATE_KEY or run with 'demo' argument to just fetch data")
        return

    try:
        # Initialize client
        client = PythOracleClient(
            rpc_url=BASE_SEPOLIA_RPC_URL,
            oracle_address=PYTH_ORACLE_ADDRESS,
            private_key=private_key
        )

        # Check if we're in demo mode
        if len(sys.argv) > 1 and sys.argv[1] == 'demo':
            print("\n🎯 Running in DEMO mode (no transactions)")
            client.demo_price_fetch("ETH/USD")
            client.demo_price_fetch("BTC/USD")
            return

        if not private_key:
            print("❌ No private key provided. Use 'demo' mode to test without transactions.")
            return

        # Update ETH/USD price
        print(f"\n🎯 Updating ETH/USD price on PythOracle contract...")
        tx_hash = client.update_price(ETH_USD_PRICE_FEED_ID)

        if tx_hash:
            print(f"\n🎉 Success! Transaction hash: {tx_hash}")
        else:
            print(f"\n❌ Failed to update price")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()