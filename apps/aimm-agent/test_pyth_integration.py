#!/usr/bin/env python3
"""
Test Pyth Network integration with the market maker agent.
"""

import sys
sys.path.insert(0, '.')

from src.utils.pyth_integration import extract_price_symbols_from_market, get_pyth_prices, format_pyth_context

# Test 1: Extract symbols from market names
print("="*80)
print("TEST 1: Symbol Extraction")
print("="*80)

test_markets = [
    "Will BTC close above $100k by end of 2024?",
    "Will ETH reach $5000?",
    "Will Donald Trump win the election?",  # No crypto
    "BTC vs ETH price ratio above 20",
    "Will SOL outperform AVAX?",
]

for market in test_markets:
    symbols = extract_price_symbols_from_market(market, {})
    print(f"\nMarket: {market}")
    print(f"Detected symbols: {symbols if symbols else 'None'}")

# Test 2: Fetch actual prices
print("\n" + "="*80)
print("TEST 2: Fetch Real Prices")
print("="*80)

test_symbols = ["BTC/USD", "ETH/USD"]
print(f"\nFetching prices for: {test_symbols}")
prices = get_pyth_prices(test_symbols)

if prices:
    print("\nRaw price data:")
    import json
    print(json.dumps(prices, indent=2))

    print("\n" + "-"*80)
    print("Formatted for LLM:")
    print("-"*80)
    print(format_pyth_context(prices))
else:
    print("No prices fetched")

print("\n" + "="*80)
print("✅ Integration test complete")
print("="*80)
