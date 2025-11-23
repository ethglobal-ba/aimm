"""
Step 7: Analyze current orderbook.
"""

from typing import Dict
import json
from datetime import datetime, timezone

from ..state import MarketState
from ..models import *
from src.utils.venice_llm import get_venice_llm
from src.utils.pyth_integration import format_pyth_context


def analyze_orderbook(state: MarketState) -> Dict:
    """Step 7: Analyze current orderbook"""
    print("\n" + "="*80)
    print("STEP 7: Analyzing current orderbook")
    print("="*80)

    market = state['orderbook_data'].get('market', {}).get('market', {})
    orderbook = state['orderbook_data'].get('orderbook', {}).get('orderbook', {})

    # Get Pyth price data from state (fetched in Step 6.5)
    pyth_prices = state.get('pyth_prices', {})
    pyth_context = ""

    if pyth_prices:
        pyth_context = "\n\n" + format_pyth_context(pyth_prices)
        print(f"\nℹ️  Using external price data from Step 6.5:")
        print(pyth_context)

    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.3,
        enable_web_search=False
    )

    # Calculate mid prices and spreads programmatically (don't trust LLM arithmetic!)
    yes_bid = market.get('yes_bid', 0)
    yes_ask = market.get('yes_ask', 0)
    no_bid = market.get('no_bid', 0)
    no_ask = market.get('no_ask', 0)

    yes_mid = (yes_bid + yes_ask) / 2 if yes_ask > 0 else yes_bid
    yes_spread = yes_ask - yes_bid if yes_ask > yes_bid else 0
    no_mid = (no_bid + no_ask) / 2 if no_ask > 0 else no_bid
    no_spread = no_ask - no_bid if no_ask > no_bid else 0

    # Format orderbook for depth analysis
    yes_orders = orderbook.get('yes', [])[:10]
    no_orders = orderbook.get('no', [])[:10]

    yes_orders_str = "\n".join([
        f"  Price: {o[0]}¢, Quantity: {o[1]}"
        for o in yes_orders if isinstance(o, (list, tuple)) and len(o) >= 2
    ])

    no_orders_str = "\n".join([
        f"  Price: {o[0]}¢, Quantity: {o[1]}"
        for o in no_orders if isinstance(o, (list, tuple)) and len(o) >= 2
    ])

    prompt = f"""You are analyzing a prediction market orderbook.
{pyth_context}

# CURRENT MARKET STATE
YES Bid: {market.get('yes_bid', 'N/A')}¢
YES Ask: {market.get('yes_ask', 'N/A')}¢
NO Bid: {market.get('no_bid', 'N/A')}¢
NO Ask: {market.get('no_ask', 'N/A')}¢
Last Price: {market.get('last_price', 'N/A')}¢
Volume (24h): {market.get('volume_24h', 'N/A')}
Open Interest: {market.get('open_interest', 'N/A')}

# ORDERBOOK

YES Orders:
{yes_orders_str}

NO Orders:
{no_orders_str}

# YOUR TASK

Calculate:
1. Mid price for YES side (average of best bid and ask)
2. Mid price for NO side
3. Spread for YES side (ask - bid)
4. Spread for NO side
5. Analyze the depth and liquidity

Return a JSON object with the orderbook analysis.
"""

    structured_llm = llm.with_structured_output(OrderbookAnalysis, method="function_calling")
    result = structured_llm.invoke(prompt)

    # Override LLM's arithmetic with our calculated values (LLMs are bad at math!)
    result.yes_mid_price = yes_mid
    result.yes_spread = yes_spread
    result.no_mid_price = no_mid
    result.no_spread = no_spread

    print("\n" + "-"*80)
    print("RAW OUTPUT:")
    print("-"*80)
    output = {
        "step": 7,
        "step_name": "Analyze Orderbook",
        "step_summary": "Analyze current orderbook state and liquidity",
        "market_ticker": state['market_ticker'],
        "step_output": result.model_dump()
    }
    print(json.dumps(output, indent=2))
    print("-"*80)

    print(f"\nOrderbook YES Mid: {yes_mid:.2f}¢")
    print(f"Orderbook YES Spread: {yes_spread:.2f}¢")
    print(f"Orderbook NO Mid: {no_mid:.2f}¢")
    print(f"Orderbook NO Spread: {no_spread:.2f}¢")

    return {
        "orderbook_mid_price": yes_mid,
        "orderbook_spread": yes_spread,
        "orderbook_no_mid_price": no_mid,
        "orderbook_no_spread": no_spread,
        "orderbook_liquidity": result.model_dump()
    }
