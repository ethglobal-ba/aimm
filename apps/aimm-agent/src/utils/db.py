"""
Database utilities for saving AI agent outputs to PostgreSQL.
"""

import os
import json
import psycopg2
from psycopg2.extras import Json
from datetime import datetime, timezone
from typing import Dict, Optional, Any


def get_db_connection():
    """Get PostgreSQL database connection from environment variables."""
    return psycopg2.connect(
        host=os.getenv('POSTGRES_HOST', 'localhost'),
        port=os.getenv('POSTGRES_PORT', '5432'),
        database=os.getenv('POSTGRES_DB', 'aimm'),
        user=os.getenv('POSTGRES_USER', 'postgres'),
        password=os.getenv('POSTGRES_PASSWORD', '')
    )


def insert_step_loading(
    run_id: str,
    step_index: int,
    market_ticker: str,
    step_kind: str,
    headline: str,
    agent_version: str = "1.0.0",
    model_version: str = "llama-3.3-70b"
):
    """
    Insert a loading row at the start of a step.

    Args:
        run_id: Unique identifier for this run
        step_index: Step number (1-12)
        market_ticker: Market ticker symbol
        step_kind: Type of step (e.g., "ANALYZE_RULES", "GENERATE_QUERIES")
        headline: Short one-line description
        agent_version: Version of the AI agent
        model_version: LLM model version used
    """
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        now = datetime.now(timezone.utc)
        cur.execute("""
            INSERT INTO ai_agent_output (
                run_id, step_index, market_ticker, step_kind,
                step_output, headline, step_loading,
                agent_version, model_version, inserted_at,
                step_started_at, price_scale
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            ON CONFLICT (run_id, step_index)
            DO UPDATE SET
                step_loading = EXCLUDED.step_loading,
                headline = EXCLUDED.headline,
                step_started_at = EXCLUDED.step_started_at
        """, (
            run_id,
            step_index,
            market_ticker,
            step_kind,
            Json({}),  # Empty output while loading
            headline,
            True,  # step_loading = True
            agent_version,
            model_version,
            now,  # inserted_at
            now,  # step_started_at
            'cents'
        ))

        conn.commit()
    finally:
        cur.close()
        conn.close()


def insert_step_output(
    run_id: str,
    step_index: int,
    market_ticker: str,
    step_kind: str,
    step_output: Dict,
    headline: str,
    summary: str,
    direction: Optional[str] = None,
    confidence: Optional[float] = None,
    agent_version: str = "1.0.0",
    model_version: str = "llama-3.3-70b"
):
    """
    Insert or update step output after completion.

    Args:
        run_id: Unique identifier for this run
        step_index: Step number (1-12)
        market_ticker: Market ticker symbol
        step_kind: Type of step
        step_output: Full step output data (JSONB)
        headline: Short one-line description
        summary: 1-2 sentence explanation
        direction: "lean_yes", "lean_no", or "neutral" (for final steps)
        confidence: 0.00-1.00 confidence level (for final steps)
        agent_version: Version of the AI agent
        model_version: LLM model version used
    """
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        now = datetime.now(timezone.utc)
        cur.execute("""
            INSERT INTO ai_agent_output (
                run_id, step_index, market_ticker, step_kind,
                step_output, headline, summary, direction, confidence,
                step_loading, agent_version, model_version,
                inserted_at, step_finished_at, price_scale
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            ON CONFLICT (run_id, step_index)
            DO UPDATE SET
                step_output = EXCLUDED.step_output,
                headline = EXCLUDED.headline,
                summary = EXCLUDED.summary,
                direction = EXCLUDED.direction,
                confidence = EXCLUDED.confidence,
                step_loading = EXCLUDED.step_loading,
                step_finished_at = EXCLUDED.step_finished_at,
                inserted_at = EXCLUDED.inserted_at
        """, (
            run_id,
            step_index,
            market_ticker,
            step_kind,
            Json(step_output),
            headline,
            summary,
            direction,
            confidence,
            False,  # step_loading = False (completed)
            agent_version,
            model_version,
            now,  # inserted_at
            now,  # step_finished_at
            'cents'
        ))

        conn.commit()
    finally:
        cur.close()
        conn.close()


def get_step_metadata(step_name: str, state: Dict[str, Any]) -> Dict[str, str]:
    """
    Get metadata (headline, summary, direction) for each step.

    Args:
        step_name: Name of the step
        state: Current state dictionary

    Returns:
        Dictionary with headline, summary, and direction
    """
    metadata_map = {
        "step_1_analyze_rules": {
            "kind": "ANALYZE_RULES",
            "loading_headline": "Analyzing market rules and generating research topics...",
            "get_headline": lambda s: f"Generated {len(s.get('research_topics', []))} research topics",
            "get_summary": lambda s: f"Analyzed market rules and identified {len(s.get('research_topics', []))} research directions for investigation.",
        },
        "step_2_generate_queries": {
            "kind": "GENERATE_QUERIES",
            "loading_headline": "Generating search queries...",
            "get_headline": lambda s: f"{len(s.get('bullish_queries', []))} bullish + {len(s.get('bearish_queries', []))} bearish queries",
            "get_summary": lambda s: f"Generated {len(s.get('bullish_queries', []))} bullish and {len(s.get('bearish_queries', []))} bearish search queries for evidence gathering.",
        },
        "step_3_search_popular_tweets": {
            "kind": "SEARCH_POPULAR_TWEETS",
            "loading_headline": "Searching popular tweets...",
            "get_headline": lambda s: f"Found {len(s.get('popular_tweets', []))} high-engagement tweets",
            "get_summary": lambda s: f"Searched Twitter for popular high-engagement tweets and found {len(s.get('popular_tweets', []))} relevant sources.",
        },
        "step_4_search_web_news": {
            "kind": "SEARCH_WEB_NEWS",
            "loading_headline": "Searching web news...",
            "get_headline": lambda s: f"Found {len(s.get('web_news', []))} news articles",
            "get_summary": lambda s: f"Searched web for credible news articles and found {len(s.get('web_news', []))} relevant sources.",
        },
        "step_5_score_baseline": {
            "kind": "SCORE_BASELINE",
            "loading_headline": "Scoring baseline sources...",
            "get_headline": lambda s: f"{s.get('baseline_summary', {}).get('overall_sentiment', 'neutral').upper()} sentiment from {len(s.get('baseline_scores', []))} sources",
            "get_summary": lambda s: f"Scored {len(s.get('baseline_scores', []))} sources with {s.get('baseline_summary', {}).get('overall_sentiment', 'neutral')} overall sentiment.",
            "get_direction": lambda s: "lean_yes" if s.get('baseline_summary', {}).get('overall_sentiment') == 'bullish' else ("lean_no" if s.get('baseline_summary', {}).get('overall_sentiment') == 'bearish' else "neutral"),
        },
        "step_6_baseline_price": {
            "kind": "CALCULATE_BASELINE_PRICE",
            "loading_headline": "Calculating baseline fair price...",
            "get_headline": lambda s: f"Baseline fair price: {s.get('baseline_fair_price', 0):.1f}¢",
            "get_summary": lambda s: f"Calculated baseline fair price of {s.get('baseline_fair_price', 0):.1f}¢ with {s.get('baseline_spread', 0):.1f}¢ spread based on research sources.",
            "get_direction": lambda s: "lean_yes" if s.get('baseline_fair_price', 0) > 50 else ("lean_no" if s.get('baseline_fair_price', 0) < 50 else "neutral"),
        },
        "step_6.5_fetch_external_prices": {
            "kind": "FETCH_EXTERNAL_PRICES",
            "loading_headline": "Fetching external price data from Pyth Network...",
            "get_headline": lambda s: f"Fetched {len(s.get('pyth_prices', {}))} external price feeds" if s.get('pyth_prices') else "No external price data available",
            "get_summary": lambda s: f"Retrieved {len(s.get('pyth_prices', {}))} price feeds from Pyth Network for cross-reference." if s.get('pyth_prices') else "No relevant external price data found for this market.",
        },
        "step_6.75_recalibrate": {
            "kind": "BAYESIAN_RECALIBRATION",
            "loading_headline": "Recalibrating baseline using Bayesian updating...",
            "get_headline": lambda s: f"Recalibrated: {s.get('recalibrated_price', 0):.1f}¢ ({s.get('orderbook_weight', 0):.0f}% orderbook)",
            "get_summary": lambda s: f"Applied Bayesian recalibration: {s.get('orderbook_weight', 0):.0f}% orderbook weight, {s.get('baseline_weight', 0):.0f}% baseline weight → {s.get('recalibrated_price', 0):.1f}¢",
            "get_direction": lambda s: "lean_yes" if s.get('recalibrated_price', 0) > 50 else ("lean_no" if s.get('recalibrated_price', 0) < 50 else "neutral"),
        },
        "step_7_analyze_orderbook": {
            "kind": "ANALYZE_ORDERBOOK",
            "loading_headline": "Analyzing current orderbook...",
            "get_headline": lambda s: f"Orderbook: YES {s.get('orderbook_mid_price', 0):.1f}¢ / NO {s.get('orderbook_no_mid_price', 0):.1f}¢",
            "get_summary": lambda s: f"Analyzed orderbook with YES mid at {s.get('orderbook_mid_price', 0):.1f}¢ and NO mid at {s.get('orderbook_no_mid_price', 0):.1f}¢.",
        },
        "step_8_search_recent_tweets": {
            "kind": "SEARCH_RECENT_TWEETS",
            "loading_headline": "Searching recent tweets for delta...",
            "get_headline": lambda s: f"Found {len(s.get('recent_tweets', []))} recent tweets (last 10 mins)",
            "get_summary": lambda s: f"Searched for very recent tweets (last 10 minutes) and found {len(s.get('recent_tweets', []))} relevant sources.",
        },
        "step_9_score_delta": {
            "kind": "SCORE_DELTA",
            "loading_headline": "Scoring delta sources...",
            "get_headline": lambda s: f"{s.get('delta_summary', {}).get('overall_sentiment', 'neutral').upper()} sentiment from recent tweets",
            "get_summary": lambda s: f"Scored recent tweets with {s.get('delta_summary', {}).get('overall_sentiment', 'neutral')} sentiment for delta adjustment.",
            "get_direction": lambda s: "lean_yes" if s.get('delta_summary', {}).get('overall_sentiment') == 'bullish' else ("lean_no" if s.get('delta_summary', {}).get('overall_sentiment') == 'bearish' else "neutral"),
        },
        "step_10_calculate_delta": {
            "kind": "CALCULATE_DELTA",
            "loading_headline": "Calculating delta adjustment...",
            "get_headline": lambda s: f"Delta adjustment: {s.get('delta_price_adjustment', 0):+.1f}¢",
            "get_summary": lambda s: f"Calculated delta price adjustment of {s.get('delta_price_adjustment', 0):+.1f}¢ based on recent tweet sentiment.",
            "get_direction": lambda s: "lean_yes" if s.get('delta_price_adjustment', 0) > 0 else ("lean_no" if s.get('delta_price_adjustment', 0) < 0 else "neutral"),
        },
        "step_11_final_adjustment": {
            "kind": "FINAL_ADJUSTMENT",
            "loading_headline": "Reconciling research vs orderbook...",
            "get_headline": lambda s: f"Final fair price: {s.get('final_fair_price', 0):.1f}¢ (leaning {s.get('lean_towards', 'neutral')})",
            "get_summary": lambda s: f"Reconciled research price with orderbook to arrive at final fair price of {s.get('final_fair_price', 0):.1f}¢.",
            "get_direction": lambda s: "lean_yes" if s.get('final_fair_price', 0) > 50 else ("lean_no" if s.get('final_fair_price', 0) < 50 else "neutral"),
        },
        "step_12_generate_orders": {
            "kind": "GENERATE_ORDERS",
            "loading_headline": "Generating final orders...",
            "get_headline": lambda s: f"Orders: YES {s.get('final_orders', {}).get('yes_bid', 0):.1f}-{s.get('final_orders', {}).get('yes_ask', 0):.1f}¢",
            "get_summary": lambda s: f"Generated final order recommendations with YES bid at {s.get('final_orders', {}).get('yes_bid', 0):.1f}¢ and ask at {s.get('final_orders', {}).get('yes_ask', 0):.1f}¢.",
            "get_direction": lambda s: "lean_yes" if s.get('final_fair_price', 0) > 50 else ("lean_no" if s.get('final_fair_price', 0) < 50 else "neutral"),
        },
    }

    return metadata_map.get(step_name, {
        "kind": "UNKNOWN",
        "loading_headline": "Processing...",
        "get_headline": lambda s: "Step completed",
        "get_summary": lambda s: "Step completed successfully.",
    })
