"""
Step 3: Search for popular tweets using bullish and bearish queries.
"""

from typing import Dict, List
import json

from ..state import MarketState
from src.utils.twitter_client import get_twitter_client


def filter_tweet_by_engagement(tweet: Dict, min_views: int = 1000) -> bool:
    """
    Filter tweets by engagement metrics to avoid spam/promotional content

    Args:
        tweet: Formatted tweet dictionary
        min_views: Minimum view count threshold

    Returns:
        True if tweet meets engagement criteria
    """
    # Must have minimum view count
    if tweet.get('views', 0) < min_views:
        return False

    # Calculate engagement rate (likes + retweets relative to views)
    views = tweet.get('views', 1)
    engagement = tweet.get('likes', 0) + tweet.get('retweets', 0)
    engagement_rate = engagement / views if views > 0 else 0

    # Must have some minimum engagement (0.1% = viral threshold)
    if engagement_rate < 0.001:
        return False

    # Check for spam indicators
    content = tweet.get('content', '').lower()
    spam_keywords = ['giveaway', 'click here', 'buy now', 'limited time', 'dm for']
    if any(keyword in content for keyword in spam_keywords):
        return False

    return True


def is_tweet_relevant(tweet: Dict, market_summary: str) -> bool:
    """
    Check if tweet content is relevant to the market

    Args:
        tweet: Formatted tweet dictionary
        market_summary: Market context for relevance checking

    Returns:
        True if tweet appears relevant
    """
    content = tweet.get('content', '').lower()

    # Very basic relevance check - can be enhanced with LLM if needed
    # For now, just filter out obvious promotional content
    promotional_indicators = [
        'amazon.de',
        'amazon.com',
        'shop now',
        'discount code',
        'affiliate link',
        '% off'
    ]

    for indicator in promotional_indicators:
        if indicator in content:
            return False

    return True


def search_popular_tweets(state: MarketState) -> Dict:
    """Step 3: Search for popular tweets (baseline sentiment)"""
    print("\n" + "="*80)
    print("STEP 3: Searching popular tweets (baseline)")
    print("="*80)

    twitter_client = get_twitter_client()
    all_tweets = []

    # Combine bullish and bearish queries
    all_queries = state['bullish_queries'] + state['bearish_queries']

    print(f"\nSearching {len(all_queries)} queries using 'Top' (popular) tweets...")

    for i, query in enumerate(all_queries, 1):
        print(f"\n[{i}/{len(all_queries)}] Query: {query}")

        # Use 'Top' for popular/high-engagement tweets
        result = twitter_client.search_tweets(
            query=query,
            query_type='Top',
            max_results=10
        )

        raw_tweets = result.get('tweets', [])
        formatted = twitter_client.format_tweets_for_analysis(raw_tweets)

        # Filter by engagement and relevance
        filtered = [
            tweet for tweet in formatted
            if filter_tweet_by_engagement(tweet, min_views=1000)
            and is_tweet_relevant(tweet, state['market_summary'])
        ]

        print(f"  Found {len(raw_tweets)} tweets, {len(filtered)} after filtering")

        # Add query metadata
        for tweet in filtered:
            tweet['search_query'] = query
            tweet['query_type'] = 'Top'

        all_tweets.extend(filtered)

    # Deduplicate by tweet URL
    seen_urls = set()
    unique_tweets = []
    for tweet in all_tweets:
        url = tweet.get('url', '')
        if url and url not in seen_urls:
            seen_urls.add(url)
            unique_tweets.append(tweet)

    # Sort by engagement (views + likes)
    unique_tweets.sort(
        key=lambda t: t.get('views', 0) + t.get('likes', 0) * 10,
        reverse=True
    )

    # Keep top 20 most engaging tweets
    popular_tweets = unique_tweets[:20]

    print("\n" + "-"*80)
    print("RAW OUTPUT:")
    print("-"*80)
    output = {
        "step": 3,
        "step_name": "Search Popular Tweets",
        "step_summary": "Search for high-engagement tweets (baseline sentiment)",
        "market_ticker": state['market_ticker'],
        "step_output": {
            "total_tweets_found": len(all_tweets),
            "unique_tweets": len(unique_tweets),
            "popular_tweets_kept": len(popular_tweets),
            "tweets": popular_tweets
        }
    }
    print(json.dumps(output, indent=2))
    print("-"*80)

    print(f"\nFOUND {len(popular_tweets)} POPULAR TWEETS:")
    for i, tweet in enumerate(popular_tweets[:5], 1):
        print(f"\n{i}. @{tweet['username']} ({tweet['likes']} likes, {tweet['views']} views)")
        print(f"   {tweet['content'][:100]}...")

    if len(popular_tweets) > 5:
        print(f"\n... and {len(popular_tweets) - 5} more tweets")

    return {
        "popular_tweets": popular_tweets
    }
