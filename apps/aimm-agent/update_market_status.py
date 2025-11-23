#!/usr/bin/env python3
"""
Update market status to Open (1) so we can call updateFairPrices.
"""

import os
import json
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "0x185D4f91D3D53a7523d312BbCa5c0B8ac2cEe32b")
RPC_URL = os.getenv("RPC_URL", "https://sepolia.base.org")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

def load_abi():
    """Load contract ABI"""
    abi_path = os.path.join(os.path.dirname(__file__), "src", "types", "AIMM.json")
    with open(abi_path, 'r') as f:
        return json.load(f).get('abi', [])

def main():
    print("="*80)
    print("UPDATING MARKET STATUS")
    print("="*80)

    # Connect to Web3
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    account = w3.eth.account.from_key(PRIVATE_KEY)

    print(f"Your Address: {account.address}")
    print(f"Contract: {CONTRACT_ADDRESS}\n")

    # Load contract
    abi = load_abi()
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(CONTRACT_ADDRESS),
        abi=abi
    )

    market_id = "TEST-MARKET-001"
    new_status = 1  # 1 = Open

    print(f"Market: {market_id}")
    print(f"New Status: {new_status} (Open)\n")

    # Build transaction
    try:
        gas_price = w3.eth.gas_price
        nonce = w3.eth.get_transaction_count(account.address)

        # Estimate gas
        gas_estimate = contract.functions.updateMarketStatus(
            market_id, new_status
        ).estimate_gas({"from": account.address})

        gas_limit = int(gas_estimate * 1.2)

        print(f"Gas estimate: {gas_estimate}")
        print(f"Gas limit: {gas_limit}")
        print(f"Gas price: {w3.from_wei(gas_price, 'gwei')} gwei\n")

        # Build transaction
        transaction = contract.functions.updateMarketStatus(
            market_id, new_status
        ).build_transaction({
            "from": account.address,
            "gas": gas_limit,
            "gasPrice": gas_price,
            "nonce": nonce,
        })

        # Sign and send
        signed_txn = w3.eth.account.sign_transaction(transaction, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)

        print(f"Transaction sent: {tx_hash.hex()}")
        print("Waiting for confirmation...")

        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        if receipt.status == 1:
            print(f"\n✅ SUCCESS! Market status updated to Open")
            print(f"Block: {receipt.blockNumber}")
            print(f"Gas used: {receipt.gasUsed}")
            print(f"\nNow you can call updateFairPrices on {market_id}")
        else:
            print(f"\n❌ Transaction failed")

    except Exception as e:
        print(f"❌ Error: {e}")

    print("="*80)

if __name__ == "__main__":
    main()
