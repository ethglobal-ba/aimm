"""
Fetch all markets from GraphQL endpoint.
"""

import requests
import json
import os
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()


GRAPHQL_ENDPOINT = os.getenv("GRAPHQL_ENDPOINT", "https://aimm.lat/graphql")


def fetch_all_markets(limit: int = 100, offset: int = 0) -> List[Dict]:
    """
    Fetch all markets from the GraphQL endpoint.

    Args:
        limit: Number of markets to fetch per page
        offset: Starting offset for pagination

    Returns:
        List of market dictionaries
    """
    # GraphQL query to fetch markets with pagination
    query = """
    query GetMarkets($limit: Int, $offset: Int) {
      markets(limit: $limit, offset: $offset) {
        items {
          id
          platform
          platformName
          tickerHash
          externalId
          marketName
          optionAText
          optionBText
          subtitle
          eventTicker
          status
          optionACurrentExternalPrice
          optionBCurrentExternalPrice
          lastExternalPriceUpdate
          optionACurrentFairPrice
          optionBCurrentFairPrice
          lastFairPriceUpdate
          minPriceDiff
          maxSpend
          slippage
          volume
          createdAt
          updatedAt
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
    """

    variables = {
        "limit": limit,
        "offset": offset
    }

    try:
        response = requests.post(
            GRAPHQL_ENDPOINT,
            json={
                "query": query,
                "variables": variables
            },
            headers={
                "Content-Type": "application/json"
            },
            timeout=30
        )

        response.raise_for_status()
        data = response.json()

        if "errors" in data:
            print(f"GraphQL errors: {data['errors']}")
            return []

        markets_data = data.get("data", {}).get("markets", {})
        return markets_data.get("items", [])

    except requests.exceptions.RequestException as e:
        print(f"Error fetching markets: {e}")
        return []


def fetch_all_markets_paginated() -> List[Dict]:
    """
    Fetch all markets with automatic pagination.

    Returns:
        List of all market dictionaries
    """
    all_markets = []
    offset = 0
    page_size = 1000

    print(f"Fetching markets from {GRAPHQL_ENDPOINT}...")

    while True:
        print(f"  Fetching page at offset {offset}...")
        markets = fetch_all_markets(limit=page_size, offset=offset)

        if not markets:
            break

        all_markets.extend(markets)
        print(f"  Retrieved {len(markets)} markets (total: {len(all_markets)})")

        # If we got fewer markets than the page size, we've reached the end
        if len(markets) < page_size:
            break

        offset += page_size

    print(f"\n✅ Total markets fetched: {len(all_markets)}")
    return all_markets


def get_active_markets() -> List[Dict]:
    """
    Get only active markets (status == 1).

    Returns:
        List of active market dictionaries
    """
    all_markets = fetch_all_markets_paginated()
    # status: 1 = active, based on the schema
    active_markets = [m for m in all_markets if m.get("status") == 1]

    print(f"Active markets: {len(active_markets)} out of {len(all_markets)}")
    return active_markets


def print_market_summary(markets: List[Dict]):
    """
    Print a summary of markets.

    Args:
        markets: List of market dictionaries
    """
    print("\n" + "="*80)
    print("MARKET SUMMARY")
    print("="*80)

    if not markets:
        print("No markets found.")
        return

    # Group by status
    by_status = {}
    for market in markets:
        status = market.get("status", "unknown")
        by_status[status] = by_status.get(status, 0) + 1

    print(f"\nTotal Markets: {len(markets)}")
    print("\nBy Status:")
    for status, count in sorted(by_status.items()):
        print(f"  {status}: {count}")

    # Show top 10 by volume
    print("\nTop 10 Markets by Volume:")
    sorted_markets = sorted(
        markets,
        key=lambda m: int(m.get("volume", 0) or 0),
        reverse=True
    )[:10]

    for i, market in enumerate(sorted_markets, 1):
        market_name = market.get("marketName", "N/A")
        external_id = market.get("externalId", "N/A")
        volume = int(market.get("volume", 0) or 0)
        status = market.get("status", "N/A")
        platform = market.get("platformName", "N/A")
        print(f"  {i}. [{external_id}] {market_name[:60]}")
        print(f"     Volume: {volume:,} | Status: {status} | Platform: {platform}")


def save_markets_to_file(markets: List[Dict], filename: str = "markets.json"):
    """
    Save markets to a JSON file.

    Args:
        markets: List of market dictionaries
        filename: Output filename
    """
    with open(filename, "w") as f:
        json.dump(markets, f, indent=2)

    print(f"\n✅ Saved {len(markets)} markets to {filename}")


if __name__ == "__main__":
    # Fetch all markets
    all_markets = fetch_all_markets_paginated()

    # Print summary
    print_market_summary(all_markets)

    # Save to file
    save_markets_to_file(all_markets, "all_markets.json")

    # Also save just active markets
    active_markets = [m for m in all_markets if m.get("status") == "active"]
    if active_markets:
        save_markets_to_file(active_markets, "active_markets.json")
