"""
Step 11: Final price adjustment combining baseline, delta, and orderbook.
"""

from typing import Dict
import json

from ..state import MarketState
from ..models import FinalPriceAdjustment
from src.utils.venice_llm import get_venice_llm


def compare_and_adjust(state: MarketState) -> Dict:
    """Step 11: Combine baseline, delta, and orderbook for final price"""
    print("\n" + "="*80)
    print("STEP 11: Final price adjustment (baseline + delta vs orderbook)")
    print("="*80)

    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.3,
        enable_web_search=False
    )

    # Calculate research price (baseline + delta)
    research_price = state['baseline_fair_price'] + state['delta_price_adjustment']

    prompt = f"""You are reconciling research-based pricing with current orderbook pricing.

# BASELINE ANALYSIS (Popular tweets + News)
Baseline Fair Price: {state['baseline_fair_price']:.2f}¢
Baseline Spread: {state['baseline_spread']:.2f}¢
Baseline Sentiment: {state['baseline_summary']['overall_sentiment']}
Baseline Confidence: {state['baseline_summary']['confidence']}
Baseline Sources: {state['baseline_summary']['bullish_count']} bullish, {state['baseline_summary']['bearish_count']} bearish

# DELTA ADJUSTMENT (Recent tweets - last 10 mins)
Delta Adjustment: {state['delta_price_adjustment']:+.2f}¢
Delta Reasoning: {state['delta_reasoning']}
Recent Tweets: {len(state.get('recent_tweets', []))}

# RESEARCH PRICE (Baseline + Delta)
Research Fair Price: {research_price:.2f}¢
Recommended Spread: {state['baseline_spread']:.2f}¢

# ORDERBOOK PRICING
Orderbook YES Mid Price: {state['orderbook_mid_price']:.2f}¢
Orderbook YES Spread: {state['orderbook_spread']:.2f}¢
Orderbook NO Mid Price: {state['orderbook_no_mid_price']:.2f}¢
Orderbook NO Spread: {state['orderbook_no_spread']:.2f}¢

# DELTA
Price Delta (Research - Orderbook): {research_price - state['orderbook_mid_price']:+.2f}¢
Spread Delta: {state['baseline_spread'] - state['orderbook_spread']:+.2f}¢

# YOUR TASK

Determine the final fair price by reconciling research vs orderbook.

**ORDERBOOK THICKNESS ANALYSIS**:

1. **Thick Orderbook** (tight spread <1¢, deep liquidity):
   - Market is efficient and likely has latest information
   - Only deviate if delta adjustment was based on VERY recent news (<10 mins)
   - If no recent delta → lean heavily towards orderbook (80-90%)

2. **Thin Orderbook** (wide spread >2¢, shallow liquidity):
   - Market may be stale or inefficient
   - Lean more towards research (60-70%)
   - Delta adjustment should have more weight

**DECISION FRAMEWORK**:

Case A: **Large Delta + Recent Breaking News + Thin Orderbook**
- Lean towards research (70-80%)
- Example: Credible breaking news in last 10 mins, orderbook hasn't updated
- Apply most of the delta adjustment

Case B: **Large Delta + Thick Orderbook OR No Recent News**
- Lean towards orderbook (70-80%)
- Example: Orderbook is thick (spread <1¢), no breaking news in last 10 mins
- Assume orderbook already knows something we don't
- Discount the delta heavily

Case C: **Small Delta + Any Orderbook**
- Take weighted average based on confidence levels
- Example: Delta is ±2¢ or less
- Blend the prices

Case D: **No Delta + Any Orderbook**
- Lean towards orderbook (70-80%)
- Example: No recent tweets, just baseline analysis
- Orderbook reflects current market consensus

**CONFIDENCE WEIGHTING**:
- High baseline confidence + high delta confidence = trust research more
- Low baseline confidence OR thick orderbook = trust orderbook more

**SPREAD ADJUSTMENT**:
- If uncertainty increased (breaking news) = widen spread
- If confirmation of baseline = keep or tighten spread
- Thick orderbook with agreement = tighter spread

Return a JSON object with:
- price_delta: Total adjustment from baseline
- spread_delta: Spread adjustment
- delta_explanation: Detailed reasoning
- final_fair_price: Final adjusted price (0-100¢)
- final_spread: Final adjusted spread
- lean_towards: "baseline", "orderbook", or "balanced"
"""

    structured_llm = llm.with_structured_output(FinalPriceAdjustment, method="function_calling")
    result = structured_llm.invoke(prompt)

    print("\n" + "-"*80)
    print("RAW OUTPUT:")
    print("-"*80)
    output = {
        "step": 11,
        "step_name": "Final Adjustment",
        "step_summary": "Reconcile research (baseline+delta) with orderbook for final price",
        "market_ticker": state['market_ticker'],
        "step_output": result.model_dump()
    }
    print(json.dumps(output, indent=2))
    print("-"*80)

    print(f"\nPRICE RECONCILIATION:")
    print(f"  Baseline: {state['baseline_fair_price']:.2f}¢")
    print(f"  + Delta: {state['delta_price_adjustment']:+.2f}¢")
    print(f"  = Research: {research_price:.2f}¢")
    print(f"  vs Orderbook: {state['orderbook_mid_price']:.2f}¢")
    print(f"\n  → FINAL PRICE: {result.final_fair_price:.2f}¢")
    print(f"  → FINAL SPREAD: {result.final_spread:.2f}¢")
    print(f"\nLEAN TOWARDS: {result.lean_towards.upper()}")
    print(f"\nEXPLANATION:")
    print(result.delta_explanation)

    return {
        "price_delta": result.price_delta,
        "spread_delta": result.spread_delta,
        "delta_explanation": result.delta_explanation,
        "final_fair_price": result.final_fair_price,
        "final_spread": result.final_spread
    }
