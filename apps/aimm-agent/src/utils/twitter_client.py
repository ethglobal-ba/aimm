"""
Twitter API client for fetching tweets
Based on twitterapi.ts implementation
"""

import os
import requests
from typing import List, Dict, Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()


class TwitterAPIClient:
    """Client for Twitter API using twitterapi.io"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('X_API_KEY')
        if not self.api_key:
            raise ValueError("X_API_KEY environment variable is required")

        self.base_url = 'https://api.twitterapi.io'
        self.headers = {'X-API-Key': self.api_key}

    def search_tweets(
        self,
        query: str,
        query_type: str = 'Latest',
        cursor: str = '',
        max_results: int = 20
    ) -> Dict:
        """
        Search for tweets using advanced search

        Args:
            query: Search query (e.g., "Taylor Swift Travis Kelce")
            query_type: 'Latest' or 'Top'
            cursor: Pagination cursor
            max_results: Maximum number of tweets to fetch

        Returns:
            Dict with tweets, has_next_page, and next_cursor
        """
        endpoint = f'{self.base_url}/twitter/tweet/advanced_search'

        params = {
            'query': query,
            'query_type': query_type,
        }

        if cursor:
            params['cursor'] = cursor

        try:
            response = requests.get(
                endpoint,
                headers=self.headers,
                params=params,
                timeout=30
            )
            response.raise_for_status()
            data = response.json()

            if 'error' in data:
                raise Exception(f"Twitter API error: {data.get('message', 'Unknown error')}")

            # Limit results
            tweets = data.get('tweets', [])[:max_results]

            return {
                'tweets': tweets,
                'has_next_page': data.get('has_next_page', False),
                'next_cursor': data.get('next_cursor', '')
            }

        except requests.exceptions.RequestException as e:
            print(f"Error fetching tweets: {e}")
            return {
                'tweets': [],
                'has_next_page': False,
                'next_cursor': ''
            }

    def format_tweets_for_analysis(self, tweets: List[Dict]) -> List[Dict]:
        """
        Format tweets into a structure suitable for market analysis

        Args:
            tweets: List of raw tweet objects from API

        Returns:
            List of formatted tweet dictionaries
        """
        formatted = []

        for tweet in tweets:
            # Parse created_at timestamp
            created_at = tweet.get('createdAt', '')

            # Extract author info
            author = tweet.get('author', {})
            author_name = author.get('name', 'Unknown')
            author_username = author.get('userName', 'unknown')
            author_verified = author.get('isVerified', False) or author.get('isBlueVerified', False)
            author_followers = author.get('followers', 0)

            formatted_tweet = {
                'source': f'Twitter @{author_username}',
                'title': f"Tweet from @{author_username}",
                'content': tweet.get('text', ''),
                'url': tweet.get('url', f'https://twitter.com/{author_username}/status/{tweet.get("id", "")}'),
                'timestamp': created_at,
                'author': author_name,
                'username': author_username,
                'verified': author_verified,
                'followers': author_followers,
                'likes': tweet.get('likeCount', 0),
                'retweets': tweet.get('retweetCount', 0),
                'replies': tweet.get('replyCount', 0),
                'views': tweet.get('viewCount', 0),
            }

            formatted.append(formatted_tweet)

        return formatted


def get_twitter_client() -> TwitterAPIClient:
    """Get a configured Twitter API client"""
    return TwitterAPIClient()
