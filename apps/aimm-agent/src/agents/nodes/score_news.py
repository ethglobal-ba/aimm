"""
Step 3: Summarize and score news sources.
"""

from typing import Dict
import json
from datetime import datetime, timezone

from ..state import MarketState
from ..models import *
from src.utils.venice_llm import get_venice_llm


def summarize_and_score(state: MarketState) -> Dict:
    """Step 3: Summarize news and assign impact scores"""
    print("\n" + "="*80)
    print("STEP 3: Summarizing news and scoring impact")
    print("="*80)

    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.3,
        enable_web_search=False
    )

    articles_summary = "\n\n".join([
        f"Source: {a['source']}\n"
        f"Type: {a.get('tweet_type', 'news')}\n"
        f"Title: {a['title']}\n"
        f"Content: {a['content']}\n"
        f"Timestamp: {a['timestamp']}\n"
        f"Engagement: Likes={a.get('likes', 'N/A')}, Views={a.get('views', 'N/A')}, Retweets={a.get('retweets', 'N/A')}\n"
        f"URL: {a['url']}"
        for a in state['news_articles']
    ])

    prompt = f"""You are analyzing news sources to determine their impact on a prediction market price.

# MARKET
{state['market_summary']}

# GATHERED NEWS

We have TWO types of Twitter data:
1. **POPULAR tweets** (high engagement): Use these for BASELINE sentiment - they represent established consensus
2. **RECENT tweets** (last 6 hours): Use these for DELTA - they show if sentiment is shifting

{articles_summary}

# YOUR TASK

Analyze each news source and:
1. Categorize as bullish or bearish
2. Assess credibility (0-10 scale)
3. Estimate price impact in cents (can be positive or negative)
4. Estimate spread impact (uncertainty adds to spread)
5. Weight by recency (very recent = 1.0, older = lower)

CRITICAL DISTINCTION:
- **Popular tweets** (Type: popular): These have high views/likes. Weight them MORE heavily as they represent established market sentiment
- **Recent tweets** (Type: recent): These are very new (last 6 hours). Weight them LESS unless they have high engagement or come from credible sources
- **News articles** (Type: news): Weight by source credibility

SCORING GUIDELINES:
- **Credibility**:
  - Official sources/Verified major accounts = 9-10
  - Major news outlets = 7-8
  - Popular tweets (>10k views) = 5-7
  - Recent low-engagement tweets = 2-4
  - Unknown sources = 1-3
- **Price Impact**: Strong evidence = ±5-10 cents, Moderate = ±2-5, Weak = ±0.5-2
- **Spread Impact**: High uncertainty = +3-5 cents, Medium = +1-3, Low = +0.5-1
- **Recency**: Last hour = 1.0, Last 6 hours = 0.8, Last 24h = 0.6, Older = 0.3

If you find credible sources on BOTH sides, this increases uncertainty and should increase spread.

Return a JSON object with:
- bullish_articles: List of bullish sources
- bearish_articles: List of bearish sources
- overall_sentiment: Overall sentiment
- source_scores: Detailed scores for each source
- confidence: Your confidence level in the analysis
"""

    structured_llm = llm.with_structured_output(NewsSummary, method="function_calling")
    result = structured_llm.invoke(prompt)

    print("\n" + "-"*80)
    print("RAW OUTPUT:")
    print("-"*80)
    output = {
        "step": 3,
        "step_name": "Score News",
        "step_summary": "Summarize and score news sources by credibility and impact",
        "market_ticker": state['market_ticker'],
        "step_output": result.model_dump()
    }
    print(json.dumps(output, indent=2))
    print("-"*80)

    print(f"\nSentiment: {result.overall_sentiment.upper()}")
    print(f"Bullish sources: {len(result.bullish_articles)}")
    print(f"Bearish sources: {len(result.bearish_articles)}")
    print(f"Confidence: {result.confidence}")

    return {
        "news_summary": result.model_dump(),
        "price_impact_scores": [s.model_dump() for s in result.source_scores]
    }
