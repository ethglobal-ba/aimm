"""
Utility functions for interacting with the AIMM smart contract.
"""

import os
import json
import sys
from decimal import Decimal
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

# Contract configuration
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "0x185D4f91D3D53a7523d312BbCa5c0B8ac2cEe32b")  # Default to Base Sepolia contract
RPC_URL = os.getenv("RPC_URL", "https://sepolia.base.org")  # Base Sepolia default


def load_contract_abi():
    """Load the contract ABI from the generated JSON file"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Go up to aimm-agent directory
    project_root = os.path.dirname(os.path.dirname(current_dir))
    abi_path = os.path.join(project_root, "src", "types", "AIMM.json")

    try:
        with open(abi_path, 'r') as f:
            contract_data = json.load(f)
            return contract_data.get('abi', [])
    except FileNotFoundError:
        print(f"Warning: ABI file not found at {abi_path}")
        print("Contract interaction will be skipped. Run 'generate-contract-types.sh' to generate the ABI file")
        return None
    except json.JSONDecodeError as e:
        print(f"Warning: Invalid JSON in ABI file: {e}")
        return None


def cents_to_wei(cents: float) -> int:
    """
    Convert price in cents (0-100) to 8 decimal format (matching external prices).

    Args:
        cents: Price in cents (e.g., 35.5)

    Returns:
        Price with 8 decimals (e.g., 35500000 for 35.5¢)
    """
    # Convert cents to 8 decimal format to match external prices
    # 35.5 cents = 35500000 (8 decimals)
    # 20 cents = 20000000 (8 decimals)
    scaled_value = int(Decimal(str(cents)) * Decimal('10') ** Decimal('6'))
    return scaled_value


def update_fair_prices(
    market_id: str,
    option_a_fair_price_cents: float,
    option_b_fair_price_cents: float,
    dry_run: bool = False
) -> dict:
    """
    Update fair prices on the AIMM contract.

    Args:
        market_id: External market identifier (e.g., "KXMARRIAGESWIFTKELCE-25")
        option_a_fair_price_cents: Fair price for option A in cents (0-100)
        option_b_fair_price_cents: Fair price for option B in cents (0-100)
        dry_run: If True, only simulate the transaction without sending it

    Returns:
        Dictionary with transaction details or error information
    """
    # Load ABI
    contract_abi = load_contract_abi()
    if not contract_abi:
        return {
            "success": False,
            "error": "Contract ABI not available",
            "skipped": True
        }

    # Get private key from environment
    private_key = os.getenv("PRIVATE_KEY")
    if not private_key:
        print("Warning: PRIVATE_KEY environment variable not set")
        print("Contract interaction will be skipped")
        return {
            "success": False,
            "error": "PRIVATE_KEY not configured",
            "skipped": True
        }

    # Convert cents to wei
    option_a_wei = cents_to_wei(option_a_fair_price_cents)
    option_b_wei = cents_to_wei(option_b_fair_price_cents)

    print(f"\n" + "="*80)
    print("UPDATING FAIR PRICES ON CONTRACT")
    print("="*80)
    print(f"Market ID: {market_id}")
    print(f"Option A: {option_a_fair_price_cents:.2f}¢ ({option_a_wei} with 8 decimals)")
    print(f"Option B: {option_b_fair_price_cents:.2f}¢ ({option_b_wei} with 8 decimals)")
    print(f"Contract: {CONTRACT_ADDRESS}")
    print(f"RPC: {RPC_URL}")
    print(f"Dry run: {dry_run}")
    print("="*80)

    try:
        # Initialize Web3 connection
        w3 = Web3(Web3.HTTPProvider(RPC_URL))
        if not w3.is_connected():
            return {
                "success": False,
                "error": f"Unable to connect to RPC at {RPC_URL}"
            }

        # Get account from private key
        account = w3.eth.account.from_key(private_key)
        print(f"Using account: {account.address}")

        # Initialize contract
        contract = w3.eth.contract(
            address=Web3.to_checksum_address(CONTRACT_ADDRESS),
            abi=contract_abi
        )

        # Get current gas price and nonce
        gas_price = w3.eth.gas_price
        nonce = w3.eth.get_transaction_count(account.address)
        print(f"Gas price: {w3.from_wei(gas_price, 'gwei')} gwei")
        print(f"Account nonce: {nonce}")

        # Estimate gas for the transaction
        gas_estimate = contract.functions.updateFairPrices(
            market_id, option_a_wei, option_b_wei
        ).estimate_gas({"from": account.address})

        # Add 20% buffer to gas estimate
        gas_limit = int(gas_estimate * 1.2)

        print(f"Estimated gas: {gas_estimate}")
        print(f"Gas limit (with buffer): {gas_limit}")

        # Build the transaction
        transaction = contract.functions.updateFairPrices(
            market_id, option_a_wei, option_b_wei
        ).build_transaction({
            "from": account.address,
            "gas": gas_limit,
            "gasPrice": gas_price,
            "nonce": nonce,
        })

        total_cost = w3.from_wei(gas_limit * gas_price, 'ether')
        print(f"Transaction cost: ~{total_cost} ETH")

        if dry_run:
            print("\n✅ Dry run successful - transaction not sent")
            return {
                "success": True,
                "dry_run": True,
                "market_id": market_id,
                "option_a_cents": option_a_fair_price_cents,
                "option_b_cents": option_b_fair_price_cents,
                "option_a_wei": option_a_wei,
                "option_b_wei": option_b_wei,
                "gas_estimate": gas_estimate,
                "gas_limit": gas_limit,
                "estimated_cost_eth": float(total_cost)
            }

        # Sign and send transaction
        signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)

        print(f"\n{'='*80}")
        print(f"📤 TRANSACTION SENT!")
        print(f"{'='*80}")
        print(f"Transaction Hash: {tx_hash.hex()}")
        print(f"Basescan URL: https://sepolia.basescan.org/tx/{tx_hash.hex()}")
        print(f"{'='*80}")
        print("⏳ Waiting for confirmation...")

        # Wait for transaction receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

        if receipt.status == 1:
            print(f"\n{'='*80}")
            print(f"✅ TRANSACTION SUCCESSFUL!")
            print(f"{'='*80}")
            print(f"Block Number: {receipt.blockNumber}")
            print(f"Gas Used: {receipt.gasUsed}")
            print(f"Basescan URL: https://sepolia.basescan.org/tx/{tx_hash.hex()}")
            print(f"{'='*80}")
            return {
                "success": True,
                "tx_hash": tx_hash.hex(),
                "block_number": receipt.blockNumber,
                "gas_used": receipt.gasUsed,
                "market_id": market_id,
                "option_a_cents": option_a_fair_price_cents,
                "option_b_cents": option_b_fair_price_cents,
                "option_a_wei": option_a_wei,
                "option_b_wei": option_b_wei,
                "basescan_url": f"https://sepolia.basescan.org/tx/{tx_hash.hex()}"
            }
        else:
            print(f"\n{'='*80}")
            print(f"❌ TRANSACTION FAILED!")
            print(f"{'='*80}")
            print(f"Transaction Hash: {tx_hash.hex()}")
            print(f"Basescan URL: https://sepolia.basescan.org/tx/{tx_hash.hex()}")
            print(f"{'='*80}")
            return {
                "success": False,
                "error": "Transaction reverted",
                "tx_hash": tx_hash.hex(),
                "basescan_url": f"https://sepolia.basescan.org/tx/{tx_hash.hex()}",
                "receipt": str(receipt)
            }

    except Exception as e:
        print(f"\n{'='*80}")
        print(f"❌ ERROR: {e}")
        print(f"{'='*80}")
        return {
            "success": False,
            "error": str(e)
        }
