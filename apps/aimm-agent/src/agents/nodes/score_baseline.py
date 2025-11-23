"""
Step 5: Score baseline sources (popular tweets + web news).
"""

from typing import Dict, List
import json

from ..state import MarketState
from ..models import NewsSummary
from src.utils.venice_llm import get_venice_llm


def score_baseline_sources(state: MarketState) -> Dict:
    """Step 5: Score and summarize baseline sources"""
    print("\n" + "="*80)
    print("STEP 5: Scoring baseline sources")
    print("="*80)

    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.3,
        enable_web_search=False
    )

    # Combine popular tweets and web news
    all_sources = []

    # Add popular tweets
    for tweet in state['popular_tweets']:
        all_sources.append({
            'type': 'tweet',
            'source': tweet['source'],
            'title': f"@{tweet['username']}: {tweet['content'][:100]}...",
            'content': tweet['content'],
            'url': tweet['url'],
            'timestamp': tweet['timestamp'],
            'metrics': {
                'views': tweet.get('views', 0),
                'likes': tweet.get('likes', 0),
                'retweets': tweet.get('retweets', 0),
                'followers': tweet.get('followers', 0),
                'verified': tweet.get('verified', False)
            }
        })

    # Add web news
    for article in state['web_news']:
        all_sources.append({
            'type': 'news',
            'source': article['source'],
            'title': article['title'],
            'content': article['content'],
            'url': article['url'],
            'timestamp': article['timestamp'],
            'relevance': article.get('relevance', '')
        })

    # Format sources for LLM
    sources_str = "\n\n".join([
        f"[{i+1}] {s['type'].upper()} - {s['source']}\n"
        f"Title: {s['title']}\n"
        f"Content: {s['content']}\n"
        f"URL: {s['url']}\n"
        f"Timestamp: {s['timestamp']}\n" +
        (f"Metrics: {s['metrics']}\n" if s['type'] == 'tweet' else "") +
        (f"Relevance: {s['relevance']}\n" if s['type'] == 'news' else "")
        for i, s in enumerate(all_sources)
    ])

    prompt = f"""You are analyzing baseline news and social media sentiment for a prediction market.

# MARKET CONTEXT
{state['market_summary']}

# SOURCES TO ANALYZE ({len(all_sources)} total)

{sources_str}

# YOUR TASK

Analyze these sources and score each one for:

1. **Credibility** (0-10):
   - Verified accounts / major publications = 8-10
   - Well-known sources = 6-8
   - Unknown sources = 3-5
   - Suspicious/spam = 0-2

2. **Price Impact** (cents, can be negative):
   - Strong bullish signal = +5 to +15 cents
   - Moderate bullish = +1 to +5 cents
   - Neutral = 0 cents
   - Moderate bearish = -1 to -5 cents
   - Strong bearish = -5 to -15 cents

3. **Spread Impact** (cents, always positive):
   - High uncertainty = +3 to +5 cents wider spread
   - Medium uncertainty = +1 to +3 cents
   - Low uncertainty = 0 to +1 cents

4. **Recency Weight** (0-1):
   - Calculate based on timestamp age
   - Very recent (< 1 day) = 0.9-1.0
   - Recent (1-3 days) = 0.7-0.9
   - Older (3-7 days) = 0.5-0.7
   - Old (> 7 days) = 0.2-0.5

**IMPORTANT**:
- Classify each source as bullish or bearish
- Consider tweet engagement (high views/likes = more credible)
- Consider news source reputation
- Balance positive and negative signals
- Be realistic about price impact

Return a JSON summary with:
- bullish_articles: List of bullish source titles
- bearish_articles: List of bearish source titles
- overall_sentiment: "bullish", "bearish", or "neutral"
- source_scores: Detailed scoring for each source
- confidence: "high", "medium", or "low"
"""

    structured_llm = llm.with_structured_output(NewsSummary, method="function_calling")
    result = structured_llm.invoke(prompt)

    print("\n" + "-"*80)
    print("RAW OUTPUT:")
    print("-"*80)
    output = {
        "step": 5,
        "step_name": "Score Baseline",
        "step_summary": "Score and analyze baseline sources (popular tweets + news)",
        "market_ticker": state['market_ticker'],
        "step_output": result.model_dump()
    }
    print(json.dumps(output, indent=2))
    print("-"*80)

    print(f"\nBASELINE SENTIMENT ANALYSIS:")
    print(f"Overall Sentiment: {result.overall_sentiment.upper()}")
    print(f"Confidence: {result.confidence.upper()}")
    print(f"\nBullish Sources ({len(result.bullish_articles)}):")
    for article in result.bullish_articles[:3]:
        print(f"  - {article}")
    if len(result.bullish_articles) > 3:
        print(f"  ... and {len(result.bullish_articles) - 3} more")

    print(f"\nBearish Sources ({len(result.bearish_articles)}):")
    for article in result.bearish_articles[:3]:
        print(f"  - {article}")
    if len(result.bearish_articles) > 3:
        print(f"  ... and {len(result.bearish_articles) - 3} more")

    print(f"\nTOP 3 HIGHEST IMPACT SOURCES:")
    top_sources = sorted(
        result.source_scores,
        key=lambda x: abs(x.price_impact) * x.credibility * x.recency_weight,
        reverse=True
    )[:3]
    for i, source in enumerate(top_sources, 1):
        print(f"{i}. {source.source}")
        print(f"   Credibility: {source.credibility}/10 | Price Impact: {source.price_impact:+.2f}¢")
        print(f"   Reasoning: {source.reasoning}")

    return {
        "baseline_summary": {
            "overall_sentiment": result.overall_sentiment,
            "confidence": result.confidence,
            "bullish_count": len(result.bullish_articles),
            "bearish_count": len(result.bearish_articles)
        },
        "baseline_scores": [score.model_dump() for score in result.source_scores]
    }
