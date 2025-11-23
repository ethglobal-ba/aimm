"""
Step 10: Calculate delta price adjustment from recent tweets.
"""

from typing import Dict
import json

from ..state import MarketState
from ..models import DeltaAdjustment
from src.utils.venice_llm import get_venice_llm


def calculate_delta_adjustment(state: MarketState) -> Dict:
    """Step 10: Calculate price adjustment from recent tweets"""
    print("\n" + "="*80)
    print("STEP 10: Calculating delta price adjustment")
    print("="*80)

    # If no recent tweets or no delta scores, return zero adjustment
    if not state['recent_tweets'] or not state['delta_scores']:
        print("\n⚠️  NO RECENT TWEETS OR SCORES - No delta adjustment")

        return {
            "delta_price_adjustment": 0.0,
            "delta_reasoning": "No recent tweets found in the last 10 minutes, so no delta adjustment applied."
        }

    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.3,
        enable_web_search=False
    )

    # Format delta scores for the prompt
    scores_str = "\n".join([
        f"{i+1}. {score['source']}\n"
        f"   Credibility: {score['credibility']}/10\n"
        f"   Price Impact: {score['price_impact']:+.2f}¢\n"
        f"   Spread Impact: {score['spread_impact']:.2f}¢\n"
        f"   Recency Weight: {score['recency_weight']:.2f}\n"
        f"   Reasoning: {score['reasoning']}"
        for i, score in enumerate(state['delta_scores'])
    ])

    # Calculate weighted average delta
    total_weighted_delta = 0
    total_weight = 0

    for score in state['delta_scores']:
        weight = score['credibility'] * score['recency_weight']
        total_weighted_delta += score['price_impact'] * weight
        total_weight += weight

    avg_delta = total_weighted_delta / total_weight if total_weight > 0 else 0

    prompt = f"""You are calculating a delta price adjustment based on VERY RECENT tweets (last 10 minutes).

# BASELINE PRICE
Baseline Fair Price: {state['baseline_fair_price']:.2f}¢
Baseline Sentiment: {state['baseline_summary']['overall_sentiment']}
Baseline Confidence: {state['baseline_summary']['confidence']}

# DELTA ANALYSIS
Delta Sentiment: {state['delta_summary']['overall_sentiment']}
Delta Confidence: {state['delta_summary']['confidence']}
Recent Tweets Analyzed: {len(state['recent_tweets'])}

# DELTA SCORES ({len(state['delta_scores'])} tweets)

{scores_str}

# CALCULATED METRICS
Weighted Average Delta: {avg_delta:+.2f}¢

# YOUR TASK

Determine the final delta price adjustment to apply to the baseline price.

**DECISION FRAMEWORK**:

1. **Breaking News (High Credibility + High Impact)**:
   - If credible source (8+/10) with strong price impact (>±5¢) = apply full delta
   - Example: Verified journalist breaks engagement news → adjust +10¢

2. **Confirming News (Aligns with Baseline)**:
   - If delta sentiment matches baseline = minimal adjustment (±0-2¢)
   - Example: More tweets about existing rumor → small adjustment

3. **Contradicting News (Opposes Baseline)**:
   - If credible source contradicts baseline = larger adjustment
   - Example: Credible denial of rumor → negative adjustment

4. **Low Credibility / No News**:
   - If low credibility (<5/10) or no strong signals = zero adjustment
   - Example: Random speculation → no adjustment

**CONFIDENCE LEVELS**:
- High: Clear breaking news from credible source(s)
- Medium: Some signals but not definitive
- Low: Weak signals or no real news

**IMPORTANT**:
- Be conservative - most recent tweets won't warrant large adjustments
- Only apply significant deltas for truly breaking, credible news
- If in doubt, return smaller adjustment
- Delta should rarely exceed ±10¢ unless major breaking news

Return a JSON object with:
- delta_price_adjustment: Adjustment in cents (can be negative)
- reasoning: Detailed explanation
- confidence: "high", "medium", or "low"
"""

    structured_llm = llm.with_structured_output(DeltaAdjustment, method="function_calling")
    result = structured_llm.invoke(prompt)

    print("\n" + "-"*80)
    print("RAW OUTPUT:")
    print("-"*80)
    output = {
        "step": 10,
        "step_name": "Calculate Delta",
        "step_summary": "Calculate price adjustment from recent tweets",
        "market_ticker": state['market_ticker'],
        "step_output": result.model_dump()
    }
    print(json.dumps(output, indent=2))
    print("-"*80)

    print(f"\nDELTA PRICE ADJUSTMENT: {result.delta_price_adjustment:+.2f}¢")
    print(f"CONFIDENCE: {result.confidence.upper()}")
    print(f"\nREASONING:")
    print(result.reasoning)

    # Show what the new price would be after delta
    new_price = state['baseline_fair_price'] + result.delta_price_adjustment
    print(f"\nBASELINE: {state['baseline_fair_price']:.2f}¢ → AFTER DELTA: {new_price:.2f}¢")

    return {
        "delta_price_adjustment": result.delta_price_adjustment,
        "delta_reasoning": result.reasoning
    }
