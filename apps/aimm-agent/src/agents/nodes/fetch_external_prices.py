"""
Step 6.5: Fetch external price data from Pyth Network.

This step fetches real-time price data for crypto assets and other financial
instruments mentioned in the market. This data is then available for all
subsequent analysis steps.
"""

from typing import Dict
import json

from ..state import MarketState
from src.utils.pyth_integration import extract_price_symbols_from_market, get_pyth_prices, format_pyth_context


def fetch_external_prices(state: MarketState) -> Dict:
    """Step 6.5: Fetch external price data from Pyth Network"""
    print("\n" + "="*80)
    print("STEP 6.5: Fetching external price data")
    print("="*80)

    # Extract market name from orderbook data
    market = state['orderbook_data'].get('market', {}).get('market', {})
    market_name = market.get('title', '')

    print(f"\nMarket: {market_name}")

    # Try to detect crypto/financial symbols in the market name
    symbols = extract_price_symbols_from_market(market_name, state.get('event_info', {}))
    pyth_prices = {}

    if symbols:
        print(f"\n📊 Detected symbols: {', '.join(symbols)}")
        print("Fetching real-time prices from Pyth Network...")
        pyth_prices = get_pyth_prices(symbols)

        if pyth_prices:
            # Format and display the price data
            pyth_context = format_pyth_context(pyth_prices)
            print(pyth_context)
            print(f"\n✅ Successfully fetched {len(pyth_prices)} price feed(s)")
        else:
            print("⚠️  No Pyth price data available for detected symbols")
    else:
        print("\nℹ️  No crypto/financial symbols detected in market name")
        print("   Skipping Pyth price fetch")

    print("\n" + "-"*80)
    print("RAW OUTPUT:")
    print("-"*80)
    output = {
        "step": 6.5,
        "step_name": "Fetch External Prices",
        "step_summary": "Fetch real-time price data from Pyth Network",
        "market_ticker": state['market_ticker'],
        "step_output": {
            "symbols_detected": symbols,
            "prices_fetched": len(pyth_prices),
            "pyth_prices": pyth_prices
        }
    }
    print(json.dumps(output, indent=2))
    print("-"*80)

    return {
        "pyth_prices": pyth_prices
    }
