"""
Stateful Market Maker Agent using LangGraph.

This workflow breaks down market analysis into 7 reasoning steps for better
decision making. Each step is implemented as a separate node for clarity.
"""

import os
import sys
import json
from dotenv import load_dotenv
from langgraph.graph import END, START, StateGraph

# Add project root to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.agents.state import MarketState
from src.agents.nodes import (
    analyze_market_rules,
    gather_news,
    summarize_and_score,
    calculate_fair_price,
    analyze_orderbook,
    compare_and_adjust,
    generate_final_orders,
)
from src.utils.kalshi_api import get_kalshi_event_info, get_kalshi_orderbook

load_dotenv()


def create_market_maker_workflow():
    """Create the stateful market maker workflow"""
    workflow = StateGraph(MarketState)

    # Add nodes
    workflow.add_node("analyze_rules", analyze_market_rules)
    workflow.add_node("gather_news", gather_news)
    workflow.add_node("score_news", summarize_and_score)
    workflow.add_node("calculate_price", calculate_fair_price)
    workflow.add_node("analyze_orderbook", analyze_orderbook)
    workflow.add_node("compare_adjust", compare_and_adjust)
    workflow.add_node("generate_orders", generate_final_orders)

    # Add edges
    workflow.add_edge(START, "analyze_rules")
    workflow.add_edge("analyze_rules", "gather_news")
    workflow.add_edge("gather_news", "score_news")
    workflow.add_edge("score_news", "calculate_price")
    workflow.add_edge("calculate_price", "analyze_orderbook")
    workflow.add_edge("analyze_orderbook", "compare_adjust")
    workflow.add_edge("compare_adjust", "generate_orders")
    workflow.add_edge("generate_orders", END)

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

    # Create workflow
    workflow = create_market_maker_workflow()

    # Initialize state
    initial_state = {
        "event_ticker": event_ticker,
        "market_ticker": market_ticker,
        "event_info": event_info,
        "orderbook_data": orderbook_data,
        "market_summary": "",
        "research_topics": [],
        "news_articles": [],
        "news_summary": {},
        "price_impact_scores": [],
        "research_fair_price": 0.0,
        "research_spread": 0.0,
        "research_reasoning": "",
        "orderbook_mid_price": 0.0,
        "orderbook_spread": 0.0,
        "orderbook_no_mid_price": 0.0,
        "orderbook_no_spread": 0.0,
        "orderbook_liquidity": {},
        "price_delta": 0.0,
        "spread_delta": 0.0,
        "delta_explanation": "",
        "final_fair_price": 0.0,
        "final_spread": 0.0,
        "final_orders": {}
    }

    # Run workflow
    result = workflow.invoke(initial_state)

    # Print summary
    print("\n" + "="*80)
    print("FINAL SUMMARY")
    print("="*80)
    print(f"Research Fair Price: {result['research_fair_price']:.2f}¢")
    print(f"Orderbook YES Mid Price: {result['orderbook_mid_price']:.2f}¢")
    print(f"Orderbook NO Mid Price: {result['orderbook_no_mid_price']:.2f}¢")
    print(f"Price Delta: {result['price_delta']:+.2f}¢")
    print(f"Final Fair Price: {result['final_fair_price']:.2f}¢")
    print(f"Final Spread: {result['final_spread']:.2f}¢")
    print(f"\nFinal Orders:")
    orders = result['final_orders']
    print(f"YES: Bid {orders['yes_bid']:.2f}¢ x {orders['yes_bid_size']} | Ask {orders['yes_ask']:.2f}¢ x {orders['yes_ask_size']}")
    print(f"NO:  Bid {orders['no_bid']:.2f}¢ x {orders['no_bid_size']} | Ask {orders['no_ask']:.2f}¢ x {orders['no_ask_size']}")
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
