"""
Step 6: Calculate baseline fair price from scored sources.
"""

from typing import Dict
import json
from datetime import datetime, timezone

from ..state import MarketState
from ..models import FairPriceEstimate
from src.utils.venice_llm import get_venice_llm


def calculate_baseline_fair_price(state: MarketState) -> Dict:
    """Step 6: Calculate baseline fair price from scored sources"""
    print("\n" + "="*80)
    print("STEP 6: Calculating baseline fair price")
    print("="*80)

    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.3,
        enable_web_search=False
    )

    # Format source scores for the prompt
    scores_str = "\n".join([
        f"{i+1}. {score['source']}\n"
        f"   Credibility: {score['credibility']}/10\n"
        f"   Price Impact: {score['price_impact']:+.2f}¢\n"
        f"   Spread Impact: {score['spread_impact']:.2f}¢\n"
        f"   Recency Weight: {score['recency_weight']:.2f}\n"
        f"   Reasoning: {score['reasoning']}"
        for i, score in enumerate(state['baseline_scores'])
    ])

    # Calculate weighted average price impact
    total_weighted_impact = 0
    total_weight = 0

    for score in state['baseline_scores']:
        weight = score['credibility'] * score['recency_weight']
        total_weighted_impact += score['price_impact'] * weight
        total_weight += weight

    avg_price_impact = total_weighted_impact / total_weight if total_weight > 0 else 0

    # Calculate time remaining to market close
    # Try multiple locations for close_date
    market = state['orderbook_data'].get('market', {}).get('market', {})
    close_date_str = market.get('close_time', '')

    days_remaining = None
    time_context = ""

    try:
        if close_date_str:
            close_date = datetime.fromisoformat(close_date_str.replace('Z', '+00:00'))
            now = datetime.now(timezone.utc)
            days_remaining = (close_date - now).days

            # Add prominent time warning
            if days_remaining < 30:
                time_context = f"\n\n🚨 **CRITICAL TIME CONSTRAINT**: ONLY {days_remaining} DAYS REMAINING 🚨\n**Market closes**: {close_date_str}\n**This is EXTREMELY time-sensitive**"
            elif days_remaining < 60:
                time_context = f"\n\n⚠️  **TIME CONSTRAINT**: {days_remaining} days remaining\n**Market closes**: {close_date_str}"
            else:
                time_context = f"\n\n**TIME REMAINING**: {days_remaining} days until market closes\n**Market closes**: {close_date_str}"

            print(f"\n⏰ TIME CONTEXT: {days_remaining} days remaining until {close_date_str}")
    except Exception as e:
        print(f"  WARNING: Could not parse close date: {e}")

    prompt = f"""You are calculating a baseline fair price for a prediction market based on scored sources.

# MARKET CONTEXT
{state['market_summary']}{time_context}

# SENTIMENT ANALYSIS
Overall Sentiment: {state['baseline_summary']['overall_sentiment']}
Confidence: {state['baseline_summary']['confidence']}
Bullish Sources: {state['baseline_summary']['bullish_count']}
Bearish Sources: {state['baseline_summary']['bearish_count']}

# SOURCE SCORES ({len(state['baseline_scores'])} sources)

{scores_str}

# CALCULATED METRICS
Weighted Average Price Impact: {avg_price_impact:+.2f}¢

# YOUR TASK

Calculate a baseline fair price (YES side) based ONLY on these sources.

**PRICING METHODOLOGY**:

1. **Start with base probability based on TIME REMAINING**:
   - For events > 180 days away: Start around 30-50¢ (uncertain future)
   - For events 60-180 days away: Start around 20-40¢
   - For events 30-60 days away: Start around 10-30¢
   - For events < 30 days away: Start around 5-20¢ (near-term, need evidence)
   - **CRITICAL**: If time is short and there's NO EVIDENCE of the event occurring, start VERY LOW (1-5¢)

2. **Apply weighted price impacts**:
   - Each source contributes: (price_impact × credibility × recency_weight)
   - Sum all weighted impacts
   - Add to base probability

3. **Reality check for date-based markets**:
   - If event requires planning (wedding, engagement) and time is short → VERY SKEPTICAL
   - If < 60 days remain and no concrete evidence (engagement ring, announcement) → Price should be LOW (<10¢)
   - Example: "Will X marry Y by Dec 31?" with 30 days left, no engagement → 2-5¢ is realistic
   - Don't let general "relationship confirmed" news inflate price if no marriage evidence

4. **Set spread based on confidence**:
   - High confidence + many sources = 1-2¢ spread
   - Medium confidence = 2-4¢ spread
   - Low confidence + few sources = 4-8¢ spread
   - Consider source agreement/disagreement

**IMPORTANT**:
- BE EXTREMELY REALISTIC about probabilities for time-sensitive events
- A confirmed relationship ≠ upcoming marriage
- Engagement news ≠ marriage will happen before deadline
- If market closes soon and no wedding plans announced → Price should be VERY LOW
- Don't let a few bullish sources override lack of concrete evidence

Return:
- fair_price: YES price in cents (0-100)
- recommended_spread: Spread in cents
- reasoning: Detailed explanation of calculation
- key_factors: List of key factors influencing the price
"""

    structured_llm = llm.with_structured_output(FairPriceEstimate, method="function_calling")
    result = structured_llm.invoke(prompt)

    print("\n" + "-"*80)
    print("RAW OUTPUT:")
    print("-"*80)
    output = {
        "step": 6,
        "step_name": "Calculate Baseline Price",
        "step_summary": "Calculate baseline fair price from scored sources",
        "market_ticker": state['market_ticker'],
        "step_output": result.model_dump()
    }
    print(json.dumps(output, indent=2))
    print("-"*80)

    print(f"\nBASELINE FAIR PRICE: {result.fair_price:.2f}¢")
    print(f"RECOMMENDED SPREAD: {result.recommended_spread:.2f}¢")
    print(f"\nKEY FACTORS:")
    for i, factor in enumerate(result.key_factors, 1):
        print(f"{i}. {factor}")

    print(f"\nREASONING:")
    print(result.reasoning)

    return {
        "baseline_fair_price": result.fair_price,
        "baseline_spread": result.recommended_spread,
        "baseline_reasoning": result.reasoning
    }
