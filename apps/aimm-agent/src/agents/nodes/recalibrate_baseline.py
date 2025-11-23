"""
Step 6.75: Recalibrate baseline price using Bayesian updating with orderbook as prior.

This step addresses the fundamental issue where baseline pricing ignores market wisdom.
Instead of treating news sentiment and orderbook as competing signals, we use Bayesian
updating: orderbook = prior belief, news = new evidence.

Key insight: If there's no recent breaking news, the orderbook price likely contains all
available information and should be trusted. News sentiment should adjust our confidence
in the orderbook price, not replace it.
"""

from typing import Dict
import json
from datetime import datetime, timezone

from ..state import MarketState
from ..models import RecalibratedPrice
from src.utils.venice_llm import get_venice_llm


def recalibrate_baseline(state: MarketState) -> Dict:
    """
    Step 6.75: Recalibrate baseline price using Bayesian framework.

    Philosophy:
    - Orderbook represents market consensus (prior)
    - News/sentiment represents new information (evidence)
    - Recalibrated price = posterior after Bayesian update

    When to trust orderbook (high weight ~80-95%):
    - No recent breaking news (>10 mins old)
    - Thick orderbook (tight spreads, good liquidity)
    - Low confidence in baseline sources

    When to trust baseline (higher weight ~40-60%):
    - Very recent breaking news (<10 mins)
    - Thin orderbook (wide spreads, poor liquidity)
    - High confidence baseline with many credible sources
    """
    print("\n" + "="*80)
    print("STEP 6.75: Bayesian recalibration (orderbook prior + news evidence)")
    print("="*80)

    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.2,  # Lower temperature for calibration
        enable_web_search=False
    )

    # Get orderbook data from state (should have been populated by step 7)
    # Use the analyzed orderbook values if available, otherwise fall back to raw data
    if 'orderbook_mid_price' in state and state['orderbook_mid_price'] > 0:
        # Use pre-analyzed values from step 7
        orderbook_yes_mid = state['orderbook_mid_price']
        orderbook_yes_spread = state['orderbook_spread']
        orderbook_no_mid = state['orderbook_no_mid_price']
        orderbook_no_spread = state['orderbook_no_spread']
        orderbook_liquidity_info = state.get('orderbook_liquidity', {})
    else:
        # Fallback: calculate from raw data
        orderbook_data = state['orderbook_data']
        market = orderbook_data.get('market', {}).get('market', {})

        yes_bid = market.get('yes_bid', 0)
        yes_ask = market.get('yes_ask', 0)
        no_bid = market.get('no_bid', 0)
        no_ask = market.get('no_ask', 0)

        orderbook_yes_mid = (yes_bid + yes_ask) / 2 if yes_ask > 0 else yes_bid
        orderbook_no_mid = (no_bid + no_ask) / 2 if no_ask > 0 else no_bid
        orderbook_yes_spread = yes_ask - yes_bid if yes_ask > yes_bid else 0
        orderbook_no_spread = no_ask - no_bid if no_ask > no_bid else 0
        orderbook_liquidity_info = {}

    # Assess orderbook quality
    orderbook_data = state['orderbook_data']
    market = orderbook_data.get('market', {}).get('market', {})
    liquidity = market.get('liquidity', 0)
    volume_24h = market.get('volume_24h', 0)

    # Check if orderbook is essentially empty or nonsensical
    is_orderbook_empty = orderbook_yes_mid < 5  # Less than 5¢ = likely empty/placeholder
    is_orderbook_valid = orderbook_yes_mid >= 5 and orderbook_yes_mid <= 95  # Reasonable range

    orderbook_quality = "unknown"
    if is_orderbook_empty:
        orderbook_quality = "empty (no real market, placeholder orders only)"
    elif not is_orderbook_valid:
        orderbook_quality = "invalid (nonsensical price)"
    elif orderbook_yes_spread > 0:
        if orderbook_yes_spread < 5 and liquidity > 50000:
            orderbook_quality = "thick (tight spread, good liquidity)"
        elif orderbook_yes_spread < 10:
            orderbook_quality = "moderate (medium spread)"
        else:
            orderbook_quality = "thin (wide spread, poor liquidity)"

    # Calculate divergence
    divergence = abs(state['baseline_fair_price'] - orderbook_yes_mid)
    divergence_pct = (divergence / orderbook_yes_mid * 100) if orderbook_yes_mid > 0 else 999

    # Check for recent news
    has_recent_news = len(state.get('recent_tweets', [])) > 0
    baseline_source_count = len(state.get('baseline_scores', []))
    baseline_confidence = state.get('baseline_summary', {}).get('confidence', 'low')

    prompt = f"""You are performing Bayesian recalibration of a prediction market price.

# BAYESIAN FRAMEWORK

**Prior (Market Consensus)**:
Orderbook YES Mid: {orderbook_yes_mid:.2f}¢
Orderbook YES Spread: {orderbook_yes_spread:.2f}¢
Orderbook NO Mid: {orderbook_no_mid:.2f}¢
Orderbook Quality: {orderbook_quality}
24h Volume: ${volume_24h:,.2f}
Liquidity: ${liquidity:,.2f}
**ORDERBOOK EMPTY**: {'YES - IGNORE ORDERBOOK!' if is_orderbook_empty else 'NO'}

**Evidence (Research)**:
Baseline Fair Price (from news): {state['baseline_fair_price']:.2f}¢
Baseline Spread: {state['baseline_spread']:.2f}¢
Baseline Confidence: {baseline_confidence}
Source Count: {baseline_source_count}
Overall Sentiment: {state['baseline_summary']['overall_sentiment']}

**Divergence**:
Absolute: {divergence:.2f}¢
Percentage: {divergence_pct:.1f}%

**Information Freshness**:
Recent Breaking News (<10 mins): {'YES' if has_recent_news else 'NO'}
Delta Tweets: {len(state.get('recent_tweets', []))}

# YOUR TASK

Perform Bayesian updating to calculate a recalibrated price.

## ⚠️ CRITICAL: EMPTY ORDERBOOK DETECTION

**IF ORDERBOOK IS EMPTY** (YES mid < 5¢):
- This is NOT a real market price - just placeholder orders
- **Orderbook weight: 0-5%** (essentially ignore it)
- **Baseline weight: 95-100%** (use research price directly)
- Set recalibrated_price ≈ baseline_fair_price
- recommended_action: "TRUST_BASELINE"
- Reasoning: "Orderbook is empty/placeholder only. Using baseline research price."

**ONLY IF ORDERBOOK HAS REAL ORDERS** (YES mid >= 5¢), proceed with normal Bayesian logic below:

## DECISION LOGIC (FOR VALID ORDERBOOKS ONLY)

### Case 1: NO RECENT BREAKING NEWS
When there's no news from the last 10 minutes:
- **Orderbook weight: 80-95%**
- Rationale: Market has had time to digest all public information
- The orderbook price IS the truth
- Baseline sentiment just confirms/adjusts confidence slightly
- Example: If orderbook=63¢, baseline=35¢, NO recent news → Use ~85% orderbook = 59-61¢

### Case 2: RECENT BREAKING NEWS + THIN ORDERBOOK
When there's breaking news AND orderbook is thin:
- **Orderbook weight: 40-60%**
- Rationale: Orderbook may not have updated yet, market is illiquid
- News provides new information market hasn't priced in
- Example: If orderbook=63¢, baseline=75¢, RECENT news + thin book → Use ~50-50 = 68-70¢

### Case 3: RECENT BREAKING NEWS + THICK ORDERBOOK
When there's breaking news BUT orderbook is thick/liquid:
- **Orderbook weight: 60-75%**
- Rationale: Thick orderbook suggests informed traders, but allow for new information
- Be skeptical: maybe the news isn't as important as we think
- Example: If orderbook=63¢, baseline=75¢, RECENT news + thick book → Use ~70% orderbook = 66-67¢

### Case 4: LOW BASELINE CONFIDENCE
When baseline has low confidence or few sources:
- **Orderbook weight: 85-95%**
- Rationale: Don't trust weak evidence over market consensus
- Example: If orderbook=63¢, baseline=35¢, LOW confidence → Use ~90% orderbook = 61-62¢

### Case 5: HIGH BASELINE CONFIDENCE + NO RECENT NEWS
When baseline has high confidence BUT no breaking news:
- **Orderbook weight: 70-80%**
- Rationale: Good research but orderbook still likely knows best
- Research can adjust our confidence in the price, not the price itself
- Example: If orderbook=63¢, baseline=35¢, HIGH confidence but OLD news → Use ~75% orderbook = 56-58¢

## SPREAD CALIBRATION

- **Converging signals** (baseline ≈ orderbook): Tighten spread (high confidence)
- **Diverging signals** (large gap): Widen spread (uncertainty about true value)
- **Thin orderbook**: Add uncertainty premium to spread
- **Thick orderbook + agreement**: Use tight spread

## OUTPUT REQUIREMENTS

Return a JSON object with:
- recalibrated_price: Bayesian posterior price (0-100¢)
- recalibrated_spread: Adjusted spread based on signal convergence
- orderbook_weight: Percentage weight given to orderbook (0-100)
- baseline_weight: Percentage weight given to baseline (0-100)
- reasoning: Detailed explanation of which case applies and why
- confidence_adjustment: How baseline research affects confidence in orderbook price
- recommended_action: "TRUST_ORDERBOOK", "BLEND_SIGNALS", or "TRUST_BASELINE"

**CRITICAL**: The orderbook_weight should almost ALWAYS be >60% unless there's very recent breaking news (<10 mins) AND a thin orderbook.
"""

    structured_llm = llm.with_structured_output(RecalibratedPrice, method="function_calling")
    result = structured_llm.invoke(prompt)

    print("\n" + "-"*80)
    print("RAW OUTPUT:")
    print("-"*80)
    output = {
        "step": 6.75,
        "step_name": "Bayesian Recalibration",
        "step_summary": "Recalibrate baseline using orderbook as prior",
        "market_ticker": state['market_ticker'],
        "step_output": result.model_dump()
    }
    print(json.dumps(output, indent=2))
    print("-"*80)

    print(f"\n📊 BAYESIAN UPDATE:")
    print(f"  Prior (Orderbook):     {orderbook_yes_mid:.2f}¢")
    print(f"  Evidence (Baseline):   {state['baseline_fair_price']:.2f}¢")
    print(f"  Divergence:            {divergence:.2f}¢ ({divergence_pct:.1f}%)")
    print(f"\n  → POSTERIOR (Recalibrated): {result.recalibrated_price:.2f}¢")
    print(f"  → SPREAD:                   {result.recalibrated_spread:.2f}¢")
    print(f"\n⚖️  WEIGHTS:")
    print(f"  Orderbook: {result.orderbook_weight:.0f}%")
    print(f"  Baseline:  {result.baseline_weight:.0f}%")
    print(f"\n✅ ACTION: {result.recommended_action}")
    print(f"\n💭 REASONING:")
    print(result.reasoning)

    return {
        "recalibrated_price": result.recalibrated_price,
        "recalibrated_spread": result.recalibrated_spread,
        "orderbook_weight": result.orderbook_weight,
        "baseline_weight": result.baseline_weight,
        "recalibration_reasoning": result.reasoning,
        "confidence_adjustment": result.confidence_adjustment,
        # Store for later use in final adjustment
        "orderbook_mid_price": orderbook_yes_mid,
        "orderbook_spread": orderbook_yes_spread,
        "orderbook_no_mid_price": orderbook_no_mid,
        "orderbook_no_spread": orderbook_no_spread,
        "orderbook_liquidity": {
            "total": liquidity,
            "volume_24h": volume_24h,
            "quality": orderbook_quality
        }
    }
