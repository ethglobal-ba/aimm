"""
State definition for the market maker workflow.
"""

from typing import Dict, List, TypedDict


class MarketState(TypedDict):
    """Complete state for market maker workflow (12 steps)"""
    # Database tracking
    run_id: str

    # Input data
    event_ticker: str
    market_ticker: str
    event_info: Dict
    orderbook_data: Dict

    # Step 1: Research topics
    market_summary: str
    research_topics: List[Dict[str, str]]

    # Step 2: Search queries
    bullish_queries: List[str]
    bearish_queries: List[str]

    # Step 3: Popular tweets (baseline)
    popular_tweets: List[Dict]

    # Step 4: Web news
    web_news: List[Dict]

    # Step 5: Baseline source scoring
    baseline_summary: Dict
    baseline_scores: List[Dict]

    # Step 6: Baseline fair price
    baseline_fair_price: float
    baseline_spread: float
    baseline_reasoning: str

    # Step 7: Orderbook analysis
    orderbook_mid_price: float
    orderbook_spread: float
    orderbook_no_mid_price: float
    orderbook_no_spread: float
    orderbook_liquidity: Dict

    # Step 8: Recent tweets (delta)
    recent_tweets: List[Dict]

    # Step 9: Delta source scoring
    delta_summary: Dict
    delta_scores: List[Dict]

    # Step 10: Delta adjustment
    delta_price_adjustment: float
    delta_reasoning: str

    # Step 11: Final price adjustment
    price_delta: float
    spread_delta: float
    delta_explanation: str
    final_fair_price: float
    final_spread: float

    # Step 12: Final orders
    final_orders: Dict
