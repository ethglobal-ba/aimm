"""
Analyze all markets from GraphQL endpoint using the AI agent.
"""

import sys
import os
import time
import json
from typing import List, Dict

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.utils.fetch_markets import fetch_all_markets_paginated
from src.agents.market_maker_stateful import analyze_market_stateful


def analyze_all_active_markets(
    status_filter: int = 1,  # 1 = active
    max_markets: int = None,
    delay_between_markets: int = 5
):
    """
    Fetch all markets and analyze each one with the AI agent.

    Args:
        status_filter: Filter by status (1 = active, 0 = inactive, 2 = other)
        max_markets: Maximum number of markets to analyze (None = all)
        delay_between_markets: Seconds to wait between each market analysis
    """
    print("="*80)
    print("ANALYZING ALL MARKETS")
    print("="*80)

    # Fetch all markets
    print("\nStep 1: Fetching markets from GraphQL...")
    all_markets = fetch_all_markets_paginated()

    if not all_markets:
        print("No markets found!")
        return

    # Filter by status
    if status_filter is not None:
        filtered_markets = [m for m in all_markets if m.get("status") == status_filter]
        print(f"\nFiltered to {len(filtered_markets)} markets with status={status_filter}")
    else:
        filtered_markets = all_markets
        print(f"\nAnalyzing all {len(filtered_markets)} markets")

    # Limit if specified
    if max_markets and len(filtered_markets) > max_markets:
        filtered_markets = filtered_markets[:max_markets]
        print(f"Limited to first {max_markets} markets")

    print(f"\nStep 2: Analyzing {len(filtered_markets)} markets...")
    print("="*80)

    results = []
    failed = []

    for i, market in enumerate(filtered_markets, 1):
        external_id = market.get("externalId", "UNKNOWN")
        market_name = market.get("marketName", "Unknown")
        platform = market.get("platformName", "Unknown")

        print(f"\n[{i}/{len(filtered_markets)}] Analyzing market:")
        print(f"  Ticker: {external_id}")
        print(f"  Name: {market_name}")
        print(f"  Platform: {platform}")
        print("-"*80)

        try:
            # Run the agent analysis
            result = analyze_market_stateful(market_ticker=external_id)

            if result:
                results.append({
                    "external_id": external_id,
                    "market_name": market_name,
                    "platform": platform,
                    "analysis": {
                        "run_id": result.get("run_id"),
                        "baseline_fair_price": result.get("baseline_fair_price"),
                        "final_fair_price": result.get("final_fair_price"),
                        "final_spread": result.get("final_spread"),
                        "final_orders": result.get("final_orders"),
                    },
                    "success": True
                })
                print(f"✅ Analysis complete for {external_id}")
            else:
                failed.append({
                    "external_id": external_id,
                    "market_name": market_name,
                    "error": "No result returned"
                })
                print(f"❌ Analysis failed for {external_id}")

        except Exception as e:
            failed.append({
                "external_id": external_id,
                "market_name": market_name,
                "error": str(e)
            })
            print(f"❌ Error analyzing {external_id}: {e}")

        # Delay between markets to avoid rate limits
        if i < len(filtered_markets) and delay_between_markets > 0:
            print(f"\nWaiting {delay_between_markets} seconds before next market...")
            time.sleep(delay_between_markets)

    # Print summary
    print("\n" + "="*80)
    print("ANALYSIS SUMMARY")
    print("="*80)
    print(f"\nTotal markets analyzed: {len(filtered_markets)}")
    print(f"Successful: {len(results)}")
    print(f"Failed: {len(failed)}")

    if failed:
        print("\nFailed markets:")
        for f in failed:
            print(f"  - {f['external_id']}: {f['error']}")

    # Save results
    summary = {
        "total_analyzed": len(filtered_markets),
        "successful": len(results),
        "failed": len(failed),
        "results": results,
        "failures": failed,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    output_file = "market_analysis_batch.json"
    with open(output_file, "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\n✅ Results saved to {output_file}")

    return summary


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Analyze all markets using AI agent")
    parser.add_argument(
        "--status",
        type=int,
        default=1,
        help="Filter by status (1=active, 0=inactive, 2=other, None=all)"
    )
    parser.add_argument(
        "--max",
        type=int,
        default=None,
        help="Maximum number of markets to analyze"
    )
    parser.add_argument(
        "--delay",
        type=int,
        default=5,
        help="Delay in seconds between each market analysis"
    )

    args = parser.parse_args()

    analyze_all_active_markets(
        status_filter=args.status,
        max_markets=args.max,
        delay_between_markets=args.delay
    )
