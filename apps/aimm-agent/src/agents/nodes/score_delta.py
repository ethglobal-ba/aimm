"""
Step 9: Score delta sources (recent tweets).
"""

from typing import Dict
import json

from ..state import MarketState
from ..models import NewsSummary
from src.utils.venice_llm import get_venice_llm


def score_delta_sources(state: MarketState) -> Dict:
    """Step 9: Score recent tweets for delta adjustment"""
    print("\n" + "="*80)
    print("STEP 9: Scoring delta sources (recent tweets)")
    print("="*80)

    # Check if there are any recent tweets
    if not state['recent_tweets']:
        print("\n⚠️  NO RECENT TWEETS - Skipping delta scoring")
        print("   Returning neutral delta (no adjustment)")

        # Return empty delta scores
        return {
            "delta_summary": {
                "overall_sentiment": "neutral",
                "confidence": "low",
                "bullish_count": 0,
                "bearish_count": 0
            },
            "delta_scores": []
        }

    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.3,
        enable_web_search=False
    )

    # Format recent tweets for analysis
    tweets_str = "\n\n".join([
        f"[{i+1}] @{tweet['username']} ({tweet['followers']} followers, "
        f"{'verified' if tweet.get('verified') else 'unverified'})\n"
        f"Content: {tweet['content']}\n"
        f"Timestamp: {tweet['timestamp']}\n"
        f"Engagement: {tweet.get('likes', 0)} likes, {tweet.get('retweets', 0)} retweets, "
        f"{tweet.get('views', 0)} views\n"
        f"URL: {tweet['url']}"
        for i, tweet in enumerate(state['recent_tweets'])
    ])

    prompt = f"""You are analyzing VERY RECENT tweets (last 10 minutes) for breaking news that could move the market.

# MARKET CONTEXT
{state['market_summary']}

# BASELINE PRICE (from earlier analysis)
Baseline Fair Price: {state['baseline_fair_price']:.2f}¢
Baseline Sentiment: {state['baseline_summary']['overall_sentiment']}

# RECENT TWEETS ({len(state['recent_tweets'])} from last 10 minutes)

{tweets_str}

# YOUR TASK

These tweets are VERY recent (last 10 minutes). Analyze if they represent BREAKING NEWS that should adjust our baseline price.

**SCORING CRITERIA**:

1. **Credibility** (0-10):
   - Large verified accounts (>100k followers) = 8-10
   - Medium accounts (10k-100k) = 6-8
   - Smaller accounts = 3-6
   - Consider verification status

2. **Price Impact** (cents, can be negative):
   - **Breaking news from credible source** = ±5 to ±15 cents
   - **Unverified rumor but high engagement** = ±1 to ±5 cents
   - **Not newsworthy** = 0 cents
   - Consider: Is this NEW information not in baseline?

3. **Spread Impact** (cents):
   - Breaking news increases uncertainty = +2 to +5 cents
   - Confirmation of baseline = 0 to +1 cents

4. **Recency Weight** (0-1):
   - All these tweets are recent, so weight by engagement
   - High engagement (>10k views) = 0.9-1.0
   - Medium engagement (1k-10k views) = 0.6-0.9
   - Low engagement (<1k views) = 0.3-0.6

**IMPORTANT**:
- Only suggest price adjustments for TRULY NEW information
- If tweets just confirm baseline sentiment = minimal impact
- Higher follower count + verified = higher credibility
- Breaking news should have strong justification

Return a JSON summary with detailed scoring for each tweet.
"""

    structured_llm = llm.with_structured_output(NewsSummary, method="function_calling")
    result = structured_llm.invoke(prompt)

    print("\n" + "-"*80)
    print("RAW OUTPUT:")
    print("-"*80)
    output = {
        "step": 9,
        "step_name": "Score Delta",
        "step_summary": "Score recent tweets for delta price adjustment",
        "market_ticker": state['market_ticker'],
        "step_output": result.model_dump()
    }
    print(json.dumps(output, indent=2))
    print("-"*80)

    print(f"\nDELTA SENTIMENT ANALYSIS:")
    print(f"Overall Sentiment: {result.overall_sentiment.upper()}")
    print(f"Confidence: {result.confidence.upper()}")
    print(f"\nBullish Tweets ({len(result.bullish_articles)}):")
    for tweet in result.bullish_articles:
        print(f"  - {tweet}")

    print(f"\nBearish Tweets ({len(result.bearish_articles)}):")
    for tweet in result.bearish_articles:
        print(f"  - {tweet}")

    if result.source_scores:
        print(f"\nTOP IMPACT TWEETS:")
        top_sources = sorted(
            result.source_scores,
            key=lambda x: abs(x.price_impact) * x.credibility * x.recency_weight,
            reverse=True
        )[:3]
        for i, source in enumerate(top_sources, 1):
            print(f"{i}. {source.source}")
            print(f"   Credibility: {source.credibility}/10 | Price Impact: {source.price_impact:+.2f}¢")
            print(f"   Reasoning: {source.reasoning}")
    else:
        print("\n⚠️  No tweets scored - likely not newsworthy")

    return {
        "delta_summary": {
            "overall_sentiment": result.overall_sentiment,
            "confidence": result.confidence,
            "bullish_count": len(result.bullish_articles),
            "bearish_count": len(result.bearish_articles)
        },
        "delta_scores": [score.model_dump() for score in result.source_scores]
    }
