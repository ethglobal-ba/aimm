"""
Step 8: Search for recent tweets (delta analysis - last 10 minutes).
"""

from typing import Dict, List
import json
from datetime import datetime, timedelta, timezone

from ..state import MarketState
from src.utils.twitter_client import get_twitter_client


def is_tweet_recent(tweet: Dict, max_age_minutes: int = 10) -> bool:
    """
    Check if tweet is recent enough for delta analysis

    Args:
        tweet: Formatted tweet dictionary
        max_age_minutes: Maximum age in minutes

    Returns:
        True if tweet is within the time window
    """
    try:
        timestamp_str = tweet.get('timestamp', '')
        if not timestamp_str:
            return False

        # Parse Twitter timestamp (ISO format)
        tweet_time = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        age = now - tweet_time

        return age.total_seconds() / 60 <= max_age_minutes

    except Exception as e:
        print(f"  WARNING: Could not parse timestamp: {e}")
        return False


def filter_tweet_by_impact(tweet: Dict, min_followers: int = 10000) -> bool:
    """
    Filter tweets by potential market impact

    Args:
        tweet: Formatted tweet dictionary
        min_followers: Minimum follower count for credibility

    Returns:
        True if tweet could impact the market
    """
    # High-follower accounts have more impact
    if tweet.get('followers', 0) >= min_followers:
        return True

    # Verified accounts with some engagement
    if tweet.get('verified', False) and tweet.get('likes', 0) + tweet.get('retweets', 0) >= 10:
        return True

    # Very high engagement on unverified account
    if tweet.get('views', 0) >= 10000:
        return True

    return False


def search_recent_tweets(state: MarketState) -> Dict:
    """Step 8: Search for recent tweets (delta analysis)"""
    print("\n" + "="*80)
    print("STEP 8: Searching recent tweets (delta)")
    print("="*80)

    twitter_client = get_twitter_client()
    all_tweets = []

    # Use same queries as baseline, but search for LATEST tweets
    all_queries = state['bullish_queries'] + state['bearish_queries']

    print(f"\nSearching {len(all_queries)} queries using 'Latest' (recent) tweets...")
    print("Looking for tweets from the last 10 minutes...")

    for i, query in enumerate(all_queries, 1):
        print(f"\n[{i}/{len(all_queries)}] Query: {query}")

        # Use 'Latest' for recent/breaking tweets
        result = twitter_client.search_tweets(
            query=query,
            query_type='Latest',
            max_results=20  # Get more to account for filtering
        )

        raw_tweets = result.get('tweets', [])
        formatted = twitter_client.format_tweets_for_analysis(raw_tweets)

        # Filter by recency (last 10 minutes) and impact
        filtered = [
            tweet for tweet in formatted
            if is_tweet_recent(tweet, max_age_minutes=10)
            and filter_tweet_by_impact(tweet, min_followers=10000)
        ]

        print(f"  Found {len(raw_tweets)} tweets, {len(filtered)} recent & impactful")

        # Add query metadata
        for tweet in filtered:
            tweet['search_query'] = query
            tweet['query_type'] = 'Latest'

        all_tweets.extend(filtered)

    # Deduplicate by tweet URL
    seen_urls = set()
    unique_tweets = []
    for tweet in all_tweets:
        url = tweet.get('url', '')
        if url and url not in seen_urls:
            seen_urls.add(url)
            unique_tweets.append(tweet)

    # Sort by recency (most recent first)
    unique_tweets.sort(
        key=lambda t: t.get('timestamp', ''),
        reverse=True
    )

    print("\n" + "-"*80)
    print("RAW OUTPUT:")
    print("-"*80)
    output = {
        "step": 8,
        "step_name": "Search Recent Tweets",
        "step_summary": "Search for very recent tweets (last 10 mins) for delta analysis",
        "market_ticker": state['market_ticker'],
        "step_output": {
            "total_tweets_found": len(all_tweets),
            "unique_tweets": len(unique_tweets),
            "tweets": unique_tweets
        }
    }
    print(json.dumps(output, indent=2))
    print("-"*80)

    if len(unique_tweets) > 0:
        print(f"\nFOUND {len(unique_tweets)} RECENT TWEETS:")
        for i, tweet in enumerate(unique_tweets[:5], 1):
            # Calculate tweet age
            try:
                tweet_time = datetime.fromisoformat(tweet['timestamp'].replace('Z', '+00:00'))
                now = datetime.now(timezone.utc)
                age_minutes = int((now - tweet_time).total_seconds() / 60)
                age_str = f"{age_minutes}m ago"
            except:
                age_str = "unknown age"

            print(f"\n{i}. @{tweet['username']} ({age_str}) - {tweet['followers']} followers")
            print(f"   {tweet['content'][:100]}...")
            print(f"   {tweet['likes']} likes, {tweet['views']} views")

        if len(unique_tweets) > 5:
            print(f"\n... and {len(unique_tweets) - 5} more tweets")
    else:
        print("\n⚠️  NO RECENT TWEETS FOUND (last 10 minutes)")
        print("   This is normal if there's no breaking news")

    return {
        "recent_tweets": unique_tweets
    }
