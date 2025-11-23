#!/usr/bin/env python3
"""
Test script to call updateFairPrices on the AIMM contract.
"""

import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.utils.contract import update_fair_prices

def test_update_fair_prices():
    """Test calling updateFairPrices with sample data"""

    # Test market ID (use the test market that exists on contract)
    market_id = "KXTRUMPENDORSE-26SEP15-JLET"

    # Test prices (in cents)
    option_a_price = 35.5  # YES price: 35.5¢
    option_b_price = 64.5  # NO price: 64.5¢

    print("="*80)
    print("TESTING CONTRACT CALL")
    print("="*80)
    print(f"\nTest Parameters:")
    print(f"  Market ID: {market_id}")
    print(f"  Option A (YES): {option_a_price}¢")
    print(f"  Option B (NO): {option_b_price}¢")
    print()

    # First try dry run
    print("="*80)
    print("TEST 1: DRY RUN (Simulation)")
    print("="*80)
    result = update_fair_prices(
        market_id=market_id,
        option_a_fair_price_cents=option_a_price,
        option_b_fair_price_cents=option_b_price,
        dry_run=True
    )

    print("\nDry Run Result:")
    print(f"  Success: {result.get('success')}")
    if result.get('success'):
        print(f"  Gas Estimate: {result.get('gas_estimate')}")
        print(f"  Gas Limit: {result.get('gas_limit')}")
        print(f"  Estimated Cost: {result.get('estimated_cost_eth')} ETH")
        print(f"  Option A Wei: {result.get('option_a_wei')}")
        print(f"  Option B Wei: {result.get('option_b_wei')}")
    else:
        print(f"  Error: {result.get('error')}")
        print(f"  Skipped: {result.get('skipped', False)}")

    # Ask if user wants to send real transaction
    print("\n" + "="*80)
    print("TEST 2: REAL TRANSACTION")
    print("="*80)

    if not result.get('success'):
        print("\n❌ Dry run failed, skipping real transaction test")
        return

    confirm = input("\n⚠️  Do you want to send a REAL transaction? (yes/no): ")
    if confirm.lower() != 'yes':
        print("\n✅ Test complete (real transaction skipped)")
        return

    print("\nSending real transaction...")
    result = update_fair_prices(
        market_id=market_id,
        option_a_fair_price_cents=option_a_price,
        option_b_fair_price_cents=option_b_price,
        dry_run=False
    )

    print("\nReal Transaction Result:")
    print(f"  Success: {result.get('success')}")
    if result.get('success'):
        print(f"  Transaction Hash: {result.get('tx_hash')}")
        print(f"  Block Number: {result.get('block_number')}")
        print(f"  Gas Used: {result.get('gas_used')}")
        print(f"  Basescan URL: {result.get('basescan_url')}")
    else:
        print(f"  Error: {result.get('error')}")

    print("\n" + "="*80)
    print("✅ Test Complete")
    print("="*80)


if __name__ == "__main__":
    test_update_fair_prices()
