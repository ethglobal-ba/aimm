#!/usr/bin/env python3
"""
Simple Pyth Hermes API client for AI agents.
Focused on finding price feeds by symbol and getting latest prices.

Usage:
    from pyth_price_client import PythClient

    client = PythClient()

    # Find a price feed by symbol
    btc_feed = client.find_price_feed("BTC/USD")

    # Get latest price for a feed
    price_data = client.get_latest_price(btc_feed['id'])
"""

import requests
from typing import Dict, List, Optional, Any
import json


class PythClient:
    """Simple Pyth Hermes API client for AI agents."""

    def __init__(self, base_url: str = "https://hermes.pyth.network"):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/json',
            'User-Agent': 'PythClient/1.0'
        })

    def get_price_feeds(self, query: Optional[str] = None, asset_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get all price feeds, optionally filtered by query and asset type.

        Args:
            query: Filter by symbol (case insensitive)
            asset_type: Filter by asset type (crypto, fx, equity, metal, rates, etc.)

        Returns:
            List of price feed dictionaries
        """
        url = f"{self.base_url}/v2/price_feeds"
        params = {}

        if query:
            params['query'] = query
        if asset_type:
            params['asset_type'] = asset_type

        try:
            response = self.session.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            return data if isinstance(data, list) else []
        except requests.exceptions.RequestException as e:
            print(f"Error fetching price feeds: {e}")
            return []

    def find_price_feed(self, symbol: str, asset_type: Optional[str] = "crypto") -> Optional[Dict[str, Any]]:
        """
        Find a specific price feed by symbol.

        Args:
            symbol: The symbol to search for (e.g., "BTC/USD", "BTC", "bitcoin")
            asset_type: Optional asset type filter

        Returns:
            Price feed dictionary or None if not found
        """
        # Try exact match first
        feeds = self.get_price_feeds(query=symbol, asset_type=asset_type)

        if feeds:
            # Look for exact symbol match
            for feed in feeds:
                if 'attributes' in feed:
                    feed_symbol = feed['attributes'].get('symbol', '')
                    if feed_symbol.lower() == symbol.lower():
                        return feed

            # If no exact match, return first result
            return feeds[0]

        # Try broader search without asset type
        feeds = self.get_price_feeds(query=symbol)
        if feeds:
            for feed in feeds:
                if 'attributes' in feed:
                    feed_symbol = feed['attributes'].get('symbol', '')
                    if feed_symbol.lower() == symbol.lower():
                        return feed
            return feeds[0]

        return None

    def get_latest_price(self, feed_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the latest price for a specific feed ID.

        Args:
            feed_id: The price feed ID

        Returns:
            Price data dictionary or None if error
        """
        url = f"{self.base_url}/v2/updates/price/latest"
        params = {'ids[]': feed_id}

        try:
            response = self.session.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            if 'parsed' in data and data['parsed']:
                return data['parsed'][0]
            return None
        except requests.exceptions.RequestException as e:
            print(f"Error fetching latest price: {e}")
            return None

    def get_price_by_symbol(self, symbol: str, asset_type: Optional[str] = "crypto") -> Optional[Dict[str, Any]]:
        """
        Get the latest price for a symbol (convenience method).

        Args:
            symbol: The symbol to get price for
            asset_type: Optional asset type filter

        Returns:
            Combined feed info and price data, or None if not found
        """
        feed = self.find_price_feed(symbol, asset_type)
        if not feed:
            return None

        price_data = self.get_latest_price(feed['id'])
        if not price_data:
            return None

        # Combine feed metadata with price data
        return {
            'feed_info': feed,
            'price_data': price_data
        }

    def format_price(self, price_data: Dict[str, Any]) -> Optional[float]:
        """
        Format price data to actual price value.

        Args:
            price_data: Price data from API response

        Returns:
            Formatted price as float or None if invalid
        """
        if 'price' not in price_data:
            return None

        try:
            price = int(price_data['price'])
            expo = int(price_data['expo'])
            return price * (10 ** expo)
        except (ValueError, KeyError):
            return None


def main():
    """Example usage of the PythClient."""
    import sys

    if len(sys.argv) < 2:
        print("Usage: python pyth_price_client.py <symbol> [asset_type]")
        print("Examples:")
        print("  python pyth_price_client.py BTC/USD")
        print("  python pyth_price_client.py ETH crypto")
        print("  python pyth_price_client.py EURUSD fx")
        sys.exit(1)

    symbol = sys.argv[1]
    asset_type = sys.argv[2] if len(sys.argv) > 2 else "crypto"

    client = PythClient()

    print(f"Searching for {symbol} in {asset_type} feeds...")

    # Find the price feed
    feed = client.find_price_feed(symbol, asset_type)
    if not feed:
        print(f"Price feed for {symbol} not found.")
        sys.exit(1)

    print(f"Found feed: {feed['attributes'].get('symbol', 'Unknown')} (ID: {feed['id']})")

    # Get latest price
    price_data = client.get_latest_price(feed['id'])
    if not price_data:
        print("Failed to get price data.")
        sys.exit(1)

    # Format and display price
    formatted_price = client.format_price(price_data.get('price', {}))
    if formatted_price is not None:
        print(f"Latest price: ${formatted_price:.8f}")

    # Show confidence interval
    conf_price = client.format_price({
        'price': price_data.get('price', {}).get('conf', '0'),
        'expo': price_data.get('price', {}).get('expo', 0)
    })
    if conf_price is not None:
        print(f"Confidence: ±${conf_price:.8f}")

    # Show timestamp
    publish_time = price_data.get('price', {}).get('publish_time')
    if publish_time:
        from datetime import datetime, timezone
        dt = datetime.fromtimestamp(publish_time, tz=timezone.utc)
        print(f"Published: {dt.strftime('%Y-%m-%d %H:%M:%S UTC')}")

    print(f"\nRaw data:")
    print(json.dumps(price_data, indent=2))


if __name__ == "__main__":
    main()