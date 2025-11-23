"""
Integration utilities for Pyth Network price feeds in the market maker agent.
"""

import re
from typing import Optional, Dict, Any
import sys
import os

# Add project root to path for pyth_price_client import
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from pyth_price_client import PythClient


def extract_price_symbols_from_market(market_name: str, event_info: Dict) -> list[str]:
    """
    Extract potential price symbols from market name or event description.

    Args:
        market_name: Market name (e.g., "Will BTC close above $50k?")
        event_info: Event information dictionary

    Returns:
        List of potential symbols to query (e.g., ["BTC/USD", "ETH/USD"])
    """
    symbols = []

    # Common crypto symbols to look for
    crypto_patterns = {
        r'\bBTC\b': 'BTC/USD',
        r'\bETH\b': 'ETH/USD',
        r'\bSOL\b': 'SOL/USD',
        r'\bAVAX\b': 'AVAX/USD',
        r'\bDOGE\b': 'DOGE/USD',
        r'\bADA\b': 'ADA/USD',
        r'\bMATIC\b': 'MATIC/USD',
        r'\bDOT\b': 'DOT/USD',
        r'\bLINK\b': 'LINK/USD',
        r'\bUNI\b': 'UNI/USD',
    }

    # Search in market name and event title
    search_text = market_name.upper()
    if event_info and 'event' in event_info:
        title = event_info['event'].get('title', '')
        search_text += ' ' + title.upper()

    # Look for crypto symbols
    for pattern, symbol in crypto_patterns.items():
        if re.search(pattern, search_text):
            symbols.append(symbol)

    return symbols


def get_pyth_prices(symbols: list[str]) -> Dict[str, Any]:
    """
    Get Pyth Network price data for the given symbols.

    Args:
        symbols: List of symbols to fetch (e.g., ["BTC/USD", "ETH/USD"])

    Returns:
        Dictionary mapping symbols to price data
    """
    if not symbols:
        return {}

    client = PythClient()
    prices = {}

    for symbol in symbols:
        try:
            result = client.get_price_by_symbol(symbol, asset_type="crypto")
            if result and result.get('price_data'):
                price_data = result['price_data']
                formatted_price = client.format_price(price_data.get('price', {}))

                if formatted_price is not None:
                    # Calculate confidence interval
                    conf_price = client.format_price({
                        'price': price_data.get('price', {}).get('conf', '0'),
                        'expo': price_data.get('price', {}).get('expo', 0)
                    })

                    prices[symbol] = {
                        'price': formatted_price,
                        'confidence': conf_price if conf_price else 0,
                        'publish_time': price_data.get('price', {}).get('publish_time'),
                        'feed_id': result['feed_info'].get('id'),
                        'symbol_full': result['feed_info'].get('attributes', {}).get('symbol', symbol)
                    }
        except Exception as e:
            print(f"Warning: Failed to fetch Pyth price for {symbol}: {e}")
            continue

    return prices


def format_pyth_context(prices: Dict[str, Any]) -> str:
    """
    Format Pyth price data into a readable context string for the LLM.

    Args:
        prices: Dictionary of price data from get_pyth_prices

    Returns:
        Formatted string for LLM context
    """
    if not prices:
        return ""

    from datetime import datetime, timezone

    lines = ["REAL-TIME PRICE DATA (Pyth Network):"]
    for symbol, data in prices.items():
        price = data['price']
        conf = data['confidence']
        timestamp = data.get('publish_time')

        time_str = ""
        if timestamp:
            dt = datetime.fromtimestamp(timestamp, tz=timezone.utc)
            time_str = f" (as of {dt.strftime('%H:%M:%S UTC')})"

        lines.append(f"  {symbol}: ${price:,.2f} ±${conf:,.2f}{time_str}")

    return "\n".join(lines)
