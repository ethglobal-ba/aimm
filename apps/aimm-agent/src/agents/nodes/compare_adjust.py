"""
Step 6: Compare research vs orderbook and adjust.
"""

from typing import Dict
import json
from datetime import datetime, timezone

from ..state import MarketState
from ..models import *
from src.utils.venice_llm import get_venice_llm


def compare_and_adjust(state: MarketState) -> Dict:
    """Step 6: Compare research price vs orderbook and adjust"""
    print("\n" + "="*80)
    print("STEP 6: Comparing research vs orderbook and adjusting")
    print("="*80)

    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.3,
        enable_web_search=False
    )

    # Get most recent news for context
    recent_news = sorted(
        state['news_articles'],
        key=lambda x: x.get('timestamp', ''),
        reverse=True
    )[:3]

    recent_news_str = "\n".join([
        f"- {n['source']} ({n['timestamp']}): {n['title']}"
        for n in recent_news
    ])

    prompt = f"""You are reconciling research-based pricing with current orderbook pricing.

# RESEARCH-BASED PRICING
Fair Price from Research: {state['research_fair_price']:.2f}¢
Recommended Spread: {state['research_spread']:.2f}¢
Reasoning: {state['research_reasoning']}

# ORDERBOOK PRICING
Orderbook YES Mid Price: {state['orderbook_mid_price']:.2f}¢
Orderbook YES Spread: {state['orderbook_spread']:.2f}¢
Orderbook NO Mid Price: {state['orderbook_no_mid_price']:.2f}¢
Orderbook NO Spread: {state['orderbook_no_spread']:.2f}¢

# DELTA
Price Delta: {state['research_fair_price'] - state['orderbook_mid_price']:.2f}¢
Spread Delta: {state['research_spread'] - state['orderbook_spread']:.2f}¢

# MOST RECENT NEWS (last 3)
{recent_news_str}

# NEWS SUMMARY
Overall Sentiment: {state['news_summary']['overall_sentiment']}
Confidence: {state['news_summary']['confidence']}

# YOUR TASK

Analyze whether the delta between research price and orderbook price makes sense:

**ORDERBOOK THICKNESS MATTERS:**
- **Thick orderbook** (low spread <1¢, many orders): Market is liquid and efficient
  - If orderbook is thick, assume it already reflects recent information
  - Only deviate from orderbook if news is <10 minutes old
- **Thin orderbook** (wide spread >2¢, few orders): Market is illiquid
  - Orderbook may be stale, lean more towards research

1. **Large Delta + Strong Recent News (<10 mins) + Thin Orderbook**: Lean towards research price
   - Very recent credible news justifies the move
   - Illiquid market hasn't updated yet
   - Apply the delta to orderbook price

2. **Large Delta + Weak/Old News (>10 mins) OR Thick Orderbook**: Lean towards orderbook price
   - If orderbook is thick (tight spread, deep), it already has the information baked in
   - If news is older than 10 minutes, market has already reacted
   - Market knows something we don't
   - Discount the research price heavily towards orderbook

3. **Small Delta**: Take weighted average

Determine:
- Does the delta make sense given the news recency AND orderbook thickness?
- Should we lean towards research or orderbook?
- What's the final adjusted fair price and spread?

Return a JSON object with delta analysis and final adjusted prices.
"""

    structured_llm = llm.with_structured_output(DeltaAnalysis, method="function_calling")
    result = structured_llm.invoke(prompt)

    print("\n" + "-"*80)
    print("RAW OUTPUT:")
    print("-"*80)
    output = {
        "step": 6,
        "step_name": "Compare and Adjust",
        "step_summary": "Compare research vs orderbook and adjust final price",
        "market_ticker": state['market_ticker'],
        "step_output": result.model_dump()
    }
    print(json.dumps(output, indent=2))
    print("-"*80)

    print(f"\nPrice Delta: {result.price_delta:+.2f}¢")
    print(f"Delta Makes Sense: {result.delta_makes_sense}")
    print(f"Lean Towards: {result.lean_towards.upper()}")
    print(f"Final Fair Price: {result.final_fair_price:.2f}¢")
    print(f"Final Spread: {result.final_spread:.2f}¢")

    return {
        "price_delta": result.price_delta,
        "spread_delta": result.spread_delta,
        "delta_explanation": result.explanation,
        "final_fair_price": result.final_fair_price,
        "final_spread": result.final_spread
    }
