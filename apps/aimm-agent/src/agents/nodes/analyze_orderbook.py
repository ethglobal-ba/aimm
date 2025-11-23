"""
Step 7: Analyze current orderbook.
"""

from typing import Dict
import json
from datetime import datetime, timezone

from ..state import MarketState
from ..models import *
from src.utils.venice_llm import get_venice_llm


def analyze_orderbook(state: MarketState) -> Dict:
    """Step 7: Analyze current orderbook"""
    print("\n" + "="*80)
    print("STEP 7: Analyzing current orderbook")
    print("="*80)

    market = state['orderbook_data'].get('market', {}).get('market', {})
    orderbook = state['orderbook_data'].get('orderbook', {}).get('orderbook', {})

    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.3,
        enable_web_search=False
    )

    # Format orderbook
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

    print(f"\nOrderbook YES Mid: {result.yes_mid_price:.2f}¢")
    print(f"Orderbook YES Spread: {result.yes_spread:.2f}¢")
    print(f"Orderbook NO Mid: {result.no_mid_price:.2f}¢")
    print(f"Orderbook NO Spread: {result.no_spread:.2f}¢")

    return {
        "orderbook_mid_price": result.yes_mid_price,
        "orderbook_spread": result.yes_spread,
        "orderbook_no_mid_price": result.no_mid_price,
        "orderbook_no_spread": result.no_spread,
        "orderbook_liquidity": result.model_dump()
    }
