"""
Step 2: Gather news, tweets, and articles.

This node searches Twitter for popular and recent tweets, and uses web search
to find recent news articles about the market topic.
"""

import json
from datetime import datetime, timezone, timedelta
from typing import Dict

from ..state import MarketState
from ..models import NewsCollection
from src.utils.venice_llm import get_venice_llm
from src.utils.twitter_client import get_twitter_client


def gather_news(state: MarketState) -> Dict:
    """Step 2: Gather news, tweets, and articles for research topics"""
    print("\n" + "="*80)
    print("STEP 2: Gathering news and tweets")
    print("="*80)

    # Extract market info to build search queries
    market = state['orderbook_data'].get('market', {}).get('market', {})
    market_title = market.get('title', '')

    # Get Twitter client and search for tweets
    all_tweets = []
    popular_tweets = []
    recent_tweets = []

    try:
        twitter_client = get_twitter_client()

        # Build search query from market title
        # For "Will Taylor Swift and Travis Kelce be married in 2025?"
        # -> "Taylor Swift Travis Kelce"
        import re
        # Extract main entities from title
        words = market_title.split()
        # Remove common question words
        stop_words = {'will', 'be', 'in', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did'}
        search_terms = [w for w in words if w.lower() not in stop_words and len(w) > 2]
        search_query = ' '.join(search_terms[:5])  # Take first 5 relevant words

        print(f"\nSearching Twitter for: '{search_query}'")

        # Phase 1: Get TOP tweets (high engagement) for baseline sentiment
        print("  Phase 1: Fetching popular tweets (high engagement)...")
        top_result = twitter_client.search_tweets(
            query=search_query,
            query_type='Top',  # Get most popular tweets
            max_results=30
        )

        top_tweets_raw = twitter_client.format_tweets_for_analysis(top_result.get('tweets', []))

        # Filter for tweets with significant engagement (views > 1000 OR likes > 10)
        popular_tweets = [
            t for t in top_tweets_raw
            if t.get('views', 0) > 1000 or t.get('likes', 0) > 10
        ]

        # Sort by engagement score (views + likes*100 + retweets*50)
        popular_tweets.sort(
            key=lambda t: t.get('views', 0) + t.get('likes', 0)*100 + t.get('retweets', 0)*50,
            reverse=True
        )
        popular_tweets = popular_tweets[:15]  # Take top 15 by engagement

        print(f"    Found {len(popular_tweets)} high-engagement tweets")
        if popular_tweets:
            top_tweet = popular_tweets[0]
            print(f"    Top tweet: {top_tweet.get('likes', 0)} likes, {top_tweet.get('views', 0)} views")

        # Phase 2: Get LATEST tweets (very recent) for delta analysis
        print("  Phase 2: Fetching very recent tweets (last few hours)...")
        latest_result = twitter_client.search_tweets(
            query=search_query,
            query_type='Latest',  # Get most recent tweets
            max_results=30
        )

        recent_tweets_raw = twitter_client.format_tweets_for_analysis(latest_result.get('tweets', []))

        # Parse timestamps and filter for tweets from last 10 minutes
        from datetime import timedelta
        now = datetime.now(timezone.utc)
        cutoff_time = now - timedelta(minutes=10)

        recent_tweets = []
        for t in recent_tweets_raw:
            timestamp_str = t.get('timestamp', '')
            try:
                # Parse Twitter timestamp format: "Sat Nov 22 18:59:00 +0000 2025"
                tweet_time = datetime.strptime(timestamp_str, '%a %b %d %H:%M:%S %z %Y')
                if tweet_time >= cutoff_time:
                    recent_tweets.append(t)
            except:
                # If we can't parse, include it anyway
                recent_tweets.append(t)

        recent_tweets = recent_tweets[:15]  # Take top 15 most recent
        print(f"    Found {len(recent_tweets)} very recent tweets (last 10 minutes)")

        # Combine both sets
        all_tweets = popular_tweets + recent_tweets
        print(f"\n  Total tweets: {len(all_tweets)} ({len(popular_tweets)} popular + {len(recent_tweets)} recent)")

    except Exception as e:
        print(f"Warning: Could not fetch tweets: {e}")
        all_tweets = []
        popular_tweets = []
        recent_tweets = []

    # Also use LLM with web search for news articles
    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.3,
        enable_web_search=True,
        enable_web_scraping=True,
        enable_web_citations=True
    )

    topics_summary = "\n".join([
        f"- {t['topic']} (stance: {t['stance']})"
        for t in state['research_topics']
    ])

    prompt = f"""You are gathering recent NEWS ARTICLES about a prediction market.

# MARKET
{state['market_summary']}

# RESEARCH TOPICS
{topics_summary}

# YOUR TASK

Search for RECENT NEWS ARTICLES (not tweets) from the last 24-48 hours.

PRIORITIES:
1. **Recency**: Focus on news from the last 24-48 hours
2. **Credibility**: Prioritize official sources, major news outlets
3. **Relevance**: Only include information directly related to the market outcome
4. **Balance**: Try to find sources for both bullish AND bearish perspectives

For news articles:
- Check major news outlets (CNN, BBC, Reuters, AP, etc.)
- Look for official announcements
- Verify publication dates

Return a JSON object with an "articles" array containing:
- source: Source name
- title: Article title
- content: Relevant content snippet (keep it concise)
- url: URL to source
- timestamp: Publication time
- relevance: Why this matters for the market
"""

    structured_llm = llm.with_structured_output(NewsCollection, method="function_calling")
    result = structured_llm.invoke(prompt)

    # Add metadata to tweets to distinguish popular vs recent
    for tweet in popular_tweets:
        tweet['tweet_type'] = 'popular'  # For baseline pricing

    for tweet in recent_tweets:
        tweet['tweet_type'] = 'recent'  # For delta adjustment

    # Combine tweets and articles
    news_articles = all_tweets + [a.model_dump() for a in result.articles]

    print("\n" + "-"*80)
    print("RAW OUTPUT:")
    print("-"*80)
    output = {
        "step": 2,
        "step_name": "Gather News",
        "step_summary": "Gather news, tweets, and articles for research topics",
        "market_ticker": state['market_ticker'],
        "step_output": {
            "popular_tweets_count": len(popular_tweets),
            "popular_tweets_sample": popular_tweets[:3],
            "recent_tweets_count": len(recent_tweets),
            "recent_tweets_sample": recent_tweets[:3],
            "news_articles_count": len(result.articles),
            "news_articles_sample": [a.model_dump() for a in result.articles][:3]
        }
    }
    print(json.dumps(output, indent=2))
    print("-"*80)

    print(f"\nGathered {len(news_articles)} total sources:")
    print(f"  - {len(popular_tweets)} popular tweets (baseline)")
    print(f"  - {len(recent_tweets)} recent tweets (delta)")
    print(f"  - {len(result.articles)} news articles")

    for article in news_articles[:5]:  # Show first 5
        source = article.get('source', 'Unknown')
        title = article.get('title', '')[:60]
        tweet_type = article.get('tweet_type', '')
        type_label = f" [{tweet_type}]" if tweet_type else ""
        print(f"- {source}{type_label}: {title}...")

    return {
        "news_articles": news_articles
    }
