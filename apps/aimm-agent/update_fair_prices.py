#!/usr/bin/env python3
"""
Script to call updateFairPrices on the AIMM contract.
Usage: python update_market_config.py <market_id> <option_a_fair_price> <option_b_fair_price>
Example: python update_market_config.py "polymarket-123" 500000000000000000 500000000000000000
"""

import sys
import os
import json
from decimal import Decimal
from web3 import Web3
from dotenv import load_dotenv


# Load environment variables
load_dotenv()

# Contract configuration
CONTRACT_ADDRESS = "0x64F65c2366BEFC2540c9312A794f0DAb5c3952F4"
RPC_URL = os.getenv("RPC_URL", "https://sepolia.base.org")  # Base Sepolia default


# Load contract ABI from generated JSON file
def load_contract_abi():
    """Load the contract ABI from the generated JSON file"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    abi_path = os.path.join(current_dir, "src", "types", "__generated__", "AIMM.json")

    try:
        with open(abi_path, "r") as f:
            contract_data = json.load(f)
            return contract_data.get("abi", [])
    except FileNotFoundError:
        print(f"Error: ABI file not found at {abi_path}")
        print("Please run 'generate-contract-types.sh' to generate the ABI file")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in ABI file: {e}")
        sys.exit(1)


CONTRACT_ABI = load_contract_abi()


def main():
    if len(sys.argv) != 4:
        print(
            "Usage: python update_market_config.py <market_id> <option_a_fair_price> <option_b_fair_price>"
        )
        print(
            "Example: python update_market_config.py 'polymarket-123' 500000000000000000 500000000000000000"
        )
        print("\nParameters:")
        print("  market_id: External market identifier (string)")
        print("  option_a_fair_price: Fair price for option A in wei (uint256)")
        print("  option_b_fair_price: Fair price for option B in wei (uint256)")
        sys.exit(1)

    market_id = sys.argv[1]
    option_a_fair_price = int(sys.argv[2])
    option_b_fair_price = int(sys.argv[3])

    # Get private key from environment
    private_key = os.getenv("PRIVATE_KEY")
    if not private_key:
        print("Error: PRIVATE_KEY environment variable is required")
        print(
            "Please set your private key in the .env file or as an environment variable"
        )
        sys.exit(1)

    # Initialize Web3 connection
    try:
        w3 = Web3(Web3.HTTPProvider(RPC_URL))
        if not w3.is_connected():
            print(f"Error: Unable to connect to RPC at {RPC_URL}")
            sys.exit(1)
        print(f"Connected to blockchain at {RPC_URL}")
    except Exception as e:
        print(f"Error connecting to blockchain: {e}")
        sys.exit(1)

    # Get account from private key
    try:
        account = w3.eth.account.from_key(private_key)
        print(f"Using account: {account.address}")
    except Exception as e:
        print(f"Error loading account: {e}")
        sys.exit(1)

    # Initialize contract
    try:
        contract = w3.eth.contract(
            address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=CONTRACT_ABI
        )
        print(f"Contract loaded at: {CONTRACT_ADDRESS}")
    except Exception as e:
        print(f"Error loading contract: {e}")
        sys.exit(1)

    # Get current gas price and nonce
    try:
        gas_price = w3.eth.gas_price
        nonce = w3.eth.get_transaction_count(account.address)
        print(f"Gas price: {w3.from_wei(gas_price, 'gwei')} gwei")
        print(f"Account nonce: {nonce}")
    except Exception as e:
        print(f"Error getting network info: {e}")
        sys.exit(1)

    # Build transaction
    try:
        # Estimate gas for the transaction
        gas_estimate = contract.functions.updateFairPrices(
            market_id, option_a_fair_price, option_b_fair_price
        ).estimate_gas({"from": account.address})

        # Add 20% buffer to gas estimate
        gas_limit = int(gas_estimate * 1.2)

        print(f"Estimated gas: {gas_estimate}")
        print(f"Gas limit (with buffer): {gas_limit}")

        # Build the transaction
        transaction = contract.functions.updateFairPrices(
            market_id, option_a_fair_price, option_b_fair_price
        ).build_transaction(
            {
                "from": account.address,
                "gas": gas_limit,
                "gasPrice": gas_price,
                "nonce": nonce,
            }
        )

        print(f"Transaction built successfully")
        print(f"Parameters:")
        print(f"  Market ID: {market_id}")
        print(f"  Option A Fair Price: {option_a_fair_price}")
        print(f"  Option B Fair Price: {option_b_fair_price}")

    except Exception as e:
        print(f"Error building transaction: {e}")
        sys.exit(1)

    # Confirm before sending
    total_cost = w3.from_wei(gas_limit * gas_price, "ether")
    print(f"\nTransaction cost: ~{total_cost} ETH")

    confirm = input("Send this transaction? (y/N): ")
    if confirm.lower() != "y":
        print("Transaction cancelled")
        sys.exit(0)

    # Sign and send transaction
    try:
        signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)

        print(f"Transaction sent!")
        print(f"Transaction hash: {tx_hash.hex()}")
        print("Waiting for confirmation...")

        # Wait for transaction receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        if receipt.status == 1:
            print(f"✅ Transaction successful!")
            print(f"Block number: {receipt.blockNumber}")
            print(f"Gas used: {receipt.gasUsed}")
        else:
            print(f"❌ Transaction failed!")
            print(f"Receipt: {receipt}")

    except Exception as e:
        print(f"Error sending transaction: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
