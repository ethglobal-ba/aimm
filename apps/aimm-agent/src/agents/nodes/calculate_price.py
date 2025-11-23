"""
Step 4: Calculate fair price from research.
"""

from typing import Dict
import json
from datetime import datetime, timezone

from ..state import MarketState
from ..models import *
from src.utils.venice_llm import get_venice_llm


def calculate_fair_price(state: MarketState) -> Dict:
    """Step 4: Calculate fair price and spread from research"""
    print("\n" + "="*80)
    print("STEP 4: Calculating fair price from research")
    print("="*80)

    # Get time context
    market = state['orderbook_data'].get('market', {}).get('market', {})
    today = datetime.now(timezone.utc)
    today_str = today.strftime('%Y-%m-%d')
    close_time_str = market.get('close_time', 'N/A')

    days_remaining = "Unknown"
    if close_time_str != 'N/A':
        try:
            close_time = datetime.fromisoformat(close_time_str.replace('Z', '+00:00'))
            days_remaining = (close_time - today).days
        except:
            pass

    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.3,
        enable_web_search=False
    )

    scores_summary = "\n".join([
        f"- {s['source']}: credibility={s['credibility']}/10, "
        f"price_impact={s['price_impact']:+.1f}¢, "
        f"spread_impact={s['spread_impact']:+.1f}¢, "
        f"recency_weight={s['recency_weight']:.2f}"
        for s in state['price_impact_scores']
    ])

    prompt = f"""You are calculating a fair price estimate based on news analysis.

# IMPORTANT TIME CONTEXT
**TODAY: {today_str}**
**MARKET CLOSES: {close_time_str}**
**DAYS REMAINING: {days_remaining} days**

This market is asking if the event will happen BEFORE {close_time_str}.
Consider the realistic probability given the time remaining.

# MARKET
{state['market_summary']}

# NEWS SUMMARY
Overall Sentiment: {state['news_summary']['overall_sentiment']}
Confidence: {state['news_summary']['confidence']}

Bullish Sources ({len(state['news_summary']['bullish_articles'])}):
{chr(10).join(['- ' + s for s in state['news_summary']['bullish_articles'][:5]])}

Bearish Sources ({len(state['news_summary']['bearish_articles'])}):
{chr(10).join(['- ' + s for s in state['news_summary']['bearish_articles'][:5]])}

# SOURCE SCORES
{scores_summary}

# YOUR TASK

Calculate a fair price and recommended spread based on the research.

CRITICAL: Consider the time remaining! For events like marriages that require planning,
{days_remaining} days may be very short or very long. Adjust your probability accordingly.

METHODOLOGY:
1. Start with a baseline probability considering time remaining
2. Apply weighted price impacts from each source (weight by credibility × recency)
3. Sum the impacts to get final fair price
4. Calculate spread based on:
   - Sum of spread impacts from sources
   - Confidence level (low confidence = wider spread)
   - Contradicting evidence (more contradiction = wider spread)

Show your math clearly in the reasoning field.

Return a JSON object with:
- fair_price: Fair YES price in cents (0-100)
- recommended_spread: Recommended spread in cents
- reasoning: Step-by-step calculation
- key_factors: Key factors influencing the price
"""

    structured_llm = llm.with_structured_output(FairPriceEstimate, method="function_calling")
    result = structured_llm.invoke(prompt)

    print("\n" + "-"*80)
    print("RAW OUTPUT:")
    print("-"*80)
    output = {
        "step": 4,
        "step_name": "Calculate Fair Price",
        "step_summary": "Calculate fair price and spread from research",
        "market_ticker": state['market_ticker'],
        "step_output": result.model_dump()
    }
    print(json.dumps(output, indent=2))
    print("-"*80)

    print(f"\nResearch Fair Price: {result.fair_price:.2f}¢")
    print(f"Recommended Spread: {result.recommended_spread:.2f}¢")

    return {
        "research_fair_price": result.fair_price,
        "research_spread": result.recommended_spread,
        "research_reasoning": result.reasoning
    }
