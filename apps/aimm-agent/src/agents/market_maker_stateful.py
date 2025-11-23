"""
Stateful Market Maker Agent using LangGraph.

This workflow breaks down market analysis into 13 reasoning steps for better
decision making. Each step is implemented as a separate node for clarity.

13-Step Workflow:
1. Analyze market rules
2. Generate search queries
3. Search popular tweets (baseline)
4. Search web news (baseline)
5. Score baseline sources
6. Calculate baseline price
6.5. Fetch external prices (Pyth Network)
7. Analyze orderbook
8. Search recent tweets (delta)
9. Score delta sources
10. Calculate delta adjustment
11. Final price adjustment
12. Generate orders
"""

import os
import sys
import json
import uuid
from datetime import datetime
from dotenv import load_dotenv
from langgraph.graph import END, START, StateGraph

# Add project root to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.agents.state import MarketState
from src.agents.nodes import (
    analyze_market_rules,
    generate_search_queries,
    search_popular_tweets,
    search_web_news,
    score_baseline_sources,
    calculate_baseline_fair_price,
    fetch_external_prices,
    analyze_orderbook,
    search_recent_tweets,
    score_delta_sources,
    calculate_delta_adjustment,
    compare_and_adjust,
    generate_final_orders,
)
from src.agents.db_wrapper import with_db_logging
from src.utils.kalshi_api import get_kalshi_event_info, get_kalshi_orderbook

load_dotenv()


def create_market_maker_workflow():
    """Create the stateful market maker workflow (13 steps) with database logging"""
    workflow = StateGraph(MarketState)

    # Wrap each node with database logging
    # Add nodes (13 steps)
    workflow.add_node("step_1_analyze_rules", with_db_logging("step_1_analyze_rules", 1)(analyze_market_rules))
    workflow.add_node("step_2_generate_queries", with_db_logging("step_2_generate_queries", 2)(generate_search_queries))
    workflow.add_node("step_3_search_popular_tweets", with_db_logging("step_3_search_popular_tweets", 3)(search_popular_tweets))
    workflow.add_node("step_4_search_web_news", with_db_logging("step_4_search_web_news", 4)(search_web_news))
    workflow.add_node("step_5_score_baseline", with_db_logging("step_5_score_baseline", 5)(score_baseline_sources))
    workflow.add_node("step_6_baseline_price", with_db_logging("step_6_baseline_price", 6)(calculate_baseline_fair_price))
    workflow.add_node("step_6.5_fetch_external_prices", with_db_logging("step_6.5_fetch_external_prices", 6.5)(fetch_external_prices))
    workflow.add_node("step_7_analyze_orderbook", with_db_logging("step_7_analyze_orderbook", 7)(analyze_orderbook))
    workflow.add_node("step_8_search_recent_tweets", with_db_logging("step_8_search_recent_tweets", 8)(search_recent_tweets))
    workflow.add_node("step_9_score_delta", with_db_logging("step_9_score_delta", 9)(score_delta_sources))
    workflow.add_node("step_10_calculate_delta", with_db_logging("step_10_calculate_delta", 10)(calculate_delta_adjustment))
    workflow.add_node("step_11_final_adjustment", with_db_logging("step_11_final_adjustment", 11)(compare_and_adjust))
    workflow.add_node("step_12_generate_orders", with_db_logging("step_12_generate_orders", 12)(generate_final_orders))

    # Add edges (sequential flow)
    workflow.add_edge(START, "step_1_analyze_rules")
    workflow.add_edge("step_1_analyze_rules", "step_2_generate_queries")
    workflow.add_edge("step_2_generate_queries", "step_3_search_popular_tweets")
    workflow.add_edge("step_3_search_popular_tweets", "step_4_search_web_news")
    workflow.add_edge("step_4_search_web_news", "step_5_score_baseline")
    workflow.add_edge("step_5_score_baseline", "step_6_baseline_price")
    workflow.add_edge("step_6_baseline_price", "step_6.5_fetch_external_prices")
    workflow.add_edge("step_6.5_fetch_external_prices", "step_7_analyze_orderbook")
    workflow.add_edge("step_7_analyze_orderbook", "step_8_search_recent_tweets")
    workflow.add_edge("step_8_search_recent_tweets", "step_9_score_delta")
    workflow.add_edge("step_9_score_delta", "step_10_calculate_delta")
    workflow.add_edge("step_10_calculate_delta", "step_11_final_adjustment")
    workflow.add_edge("step_11_final_adjustment", "step_12_generate_orders")
    workflow.add_edge("step_12_generate_orders", END)

    return workflow.compile()


def analyze_market_stateful(market_ticker: str):
    """
    Analyze a market using the stateful workflow.

    Args:
        market_ticker: Kalshi market ticker (e.g., "KXMARRIAGESWIFTKELCE-25")

    Returns:
        Complete state with all analysis steps
    """
    print("="*80)
    print("STATEFUL MARKET MAKER ANALYSIS")
    print("="*80)
    print(f"Market: {market_ticker}")
    print("="*80)

    # Fetch market and orderbook data first
    print("\nFetching market and orderbook data...")
    orderbook_data = get_kalshi_orderbook(market_ticker)

    if not orderbook_data:
        print("Failed to fetch market data")
        return None

    # Extract event_ticker from market data
    event_ticker = None
    if "market" in orderbook_data and "market" in orderbook_data["market"]:
        event_ticker = orderbook_data["market"]["market"].get("event_ticker")

    if not event_ticker:
        print("Error: Could not extract event_ticker from market data")
        return None

    print(f"Event: {event_ticker}")

    # Fetch event info and contract rules
    print("\nFetching event info and contract rules...")
    event_info = get_kalshi_event_info(event_ticker, fetch_contract=True)

    if not event_info:
        print("Failed to fetch event info")
        return None

    # Generate unique run ID for this analysis
    run_id = str(uuid.uuid4())
    print(f"\nRun ID: {run_id}")

    # Create workflow
    workflow = create_market_maker_workflow()

    # Initialize state (13-step workflow)
    initial_state = {
        # Database tracking
        "run_id": run_id,

        # Input data
        "event_ticker": event_ticker,
        "market_ticker": market_ticker,
        "event_info": event_info,
        "orderbook_data": orderbook_data,

        # Step 1: Research topics
        "market_summary": "",
        "research_topics": [],

        # Step 2: Search queries
        "bullish_queries": [],
        "bearish_queries": [],

        # Step 3: Popular tweets (baseline)
        "popular_tweets": [],

        # Step 4: Web news
        "web_news": [],

        # Step 5: Baseline source scoring
        "baseline_summary": {},
        "baseline_scores": [],

        # Step 6: Baseline fair price
        "baseline_fair_price": 0.0,
        "baseline_spread": 0.0,
        "baseline_reasoning": "",

        # Step 6.5: External price data
        "pyth_prices": {},

        # Step 7: Orderbook analysis
        "orderbook_mid_price": 0.0,
        "orderbook_spread": 0.0,
        "orderbook_no_mid_price": 0.0,
        "orderbook_no_spread": 0.0,
        "orderbook_liquidity": {},

        # Step 8: Recent tweets (delta)
        "recent_tweets": [],

        # Step 9: Delta source scoring
        "delta_summary": {},
        "delta_scores": [],

        # Step 10: Delta adjustment
        "delta_price_adjustment": 0.0,
        "delta_reasoning": "",

        # Step 11: Final price adjustment
        "price_delta": 0.0,
        "spread_delta": 0.0,
        "delta_explanation": "",
        "final_fair_price": 0.0,
        "final_spread": 0.0,

        # Step 12: Final orders and contract update
        "final_orders": {},
        "contract_update": {}
    }

    # Run workflow
    result = workflow.invoke(initial_state)

    # Print summary
    print("\n" + "="*80)
    print("FINAL SUMMARY (13-STEP WORKFLOW)")
    print("="*80)
    print(f"\nBASELINE ANALYSIS:")
    print(f"  Baseline Fair Price: {result['baseline_fair_price']:.2f}¢")
    print(f"  Baseline Spread: {result['baseline_spread']:.2f}¢")
    print(f"  Sources: {len(result.get('popular_tweets', []))} tweets, {len(result.get('web_news', []))} news articles")

    print(f"\nEXTERNAL PRICE DATA:")
    pyth_prices = result.get('pyth_prices', {})
    if pyth_prices:
        print(f"  Pyth Network feeds: {len(pyth_prices)}")
        for symbol, data in pyth_prices.items():
            print(f"    {symbol}: ${data['price']:,.2f}")
    else:
        print(f"  No external price data (market not crypto-related)")

    print(f"\nDELTA ADJUSTMENT:")
    print(f"  Delta Adjustment: {result['delta_price_adjustment']:+.2f}¢")
    print(f"  Recent Tweets: {len(result.get('recent_tweets', []))}")

    print(f"\nORDERBOOK:")
    print(f"  YES Mid Price: {result['orderbook_mid_price']:.2f}¢ (spread: {result['orderbook_spread']:.2f}¢)")
    print(f"  NO Mid Price: {result['orderbook_no_mid_price']:.2f}¢ (spread: {result['orderbook_no_spread']:.2f}¢)")

    print(f"\nFINAL PRICING:")
    print(f"  Final Fair Price: {result['final_fair_price']:.2f}¢")
    print(f"  Final Spread: {result['final_spread']:.2f}¢")

    print(f"\nFINAL ORDERS:")
    orders = result['final_orders']
    print(f"  YES: Bid {orders['yes_bid']:.2f}¢ x {orders['yes_bid_size']} | Ask {orders['yes_ask']:.2f}¢ x {orders['yes_ask_size']}")
    print(f"  NO:  Bid {orders['no_bid']:.2f}¢ x {orders['no_bid_size']} | Ask {orders['no_ask']:.2f}¢ x {orders['no_ask_size']}")
    print("="*80)

    return result


if __name__ == "__main__":
    # Example usage
    result = analyze_market_stateful(
        market_ticker="KXMARRIAGESWIFTKELCE-25"
    )

    if result:
        # Save detailed results
        with open("market_analysis_stateful.json", "w") as f:
            json_result = {
                k: v for k, v in result.items()
                if k not in ['event_info', 'orderbook_data']  # Skip large objects
            }
            json.dump(json_result, f, indent=2)
        print("\n✅ Detailed results saved to market_analysis_stateful.json")
