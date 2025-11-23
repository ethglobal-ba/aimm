"""
Step 7: Generate final order recommendations.
"""

from typing import Dict
import json
from datetime import datetime, timezone

from ..state import MarketState
from ..models import *
from src.utils.venice_llm import get_venice_llm


def generate_final_orders(state: MarketState) -> Dict:
    """Step 7: Generate final order recommendations"""
    print("\n" + "="*80)
    print("STEP 7: Generating final order recommendations")
    print("="*80)

    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.3,
        enable_web_search=False
    )

    prompt = f"""You are generating final market-making orders.

# FINAL PRICING
Fair Price: {state['final_fair_price']:.2f}¢
Recommended Spread: {state['final_spread']:.2f}¢

# CURRENT ORDERBOOK
YES Mid Price: {state['orderbook_mid_price']:.2f}¢
YES Spread: {state['orderbook_spread']:.2f}¢
NO Mid Price: {state['orderbook_no_mid_price']:.2f}¢
NO Spread: {state['orderbook_no_spread']:.2f}¢

# YOUR TASK

Generate competitive market-making orders:

1. **Calculate YES orders**:
   - YES Bid = Fair Price - (Spread / 2)
   - YES Ask = Fair Price + (Spread / 2)

2. **Calculate NO orders** (remembering YES + NO = 100):
   - NO Bid = 100 - YES Ask
   - NO Ask = 100 - YES Bid

3. **Determine position sizes**:
   - Higher confidence = larger sizes (50-100 contracts)
   - Medium confidence = medium sizes (20-50 contracts)
   - Lower confidence = smaller sizes (5-20 contracts)
   - Consider orderbook liquidity on BOTH sides
   - For low-probability events (YES < 10¢), NO side often has more volume
   - Consider placing larger sizes on NO if that's where the market activity is

4. **Ensure competitiveness**:
   - Compare your YES orders to current YES orderbook (mid/spread)
   - Compare your NO orders to current NO orderbook (mid/spread)
   - Your orders should be competitive on BOTH sides
   - Don't cross the market (bid > ask)
   - For low-probability events, prioritize competitive NO pricing

Return a JSON object with final order recommendations for both YES and NO sides.
"""

    structured_llm = llm.with_structured_output(FinalOrders, method="function_calling")
    result = structured_llm.invoke(prompt)

    print("\n" + "-"*80)
    print("RAW OUTPUT:")
    print("-"*80)
    output = {
        "step": 7,
        "step_name": "Generate Orders",
        "step_summary": "Generate final order recommendations for market making",
        "market_ticker": state['market_ticker'],
        "step_output": result.model_dump()
    }
    print(json.dumps(output, indent=2))
    print("-"*80)

    print(f"\nFINAL ORDERS:")
    print(f"YES: Bid {result.yes_bid:.2f}¢ x {result.yes_bid_size} | Ask {result.yes_ask:.2f}¢ x {result.yes_ask_size}")
    print(f"NO:  Bid {result.no_bid:.2f}¢ x {result.no_bid_size} | Ask {result.no_ask:.2f}¢ x {result.no_ask_size}")

    return {
        "final_orders": result.model_dump()
    }

