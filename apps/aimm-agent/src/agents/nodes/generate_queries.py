"""
Step 2: Generate search queries for bullish and bearish perspectives.
"""

from typing import Dict
import json
from datetime import datetime, timezone

from ..state import MarketState
from ..models import SearchQueries
from src.utils.venice_llm import get_venice_llm


def generate_search_queries(state: MarketState) -> Dict:
    """Step 2: Generate targeted search queries for bullish and bearish perspectives"""
    print("\n" + "="*80)
    print("STEP 2: Generating search queries")
    print("="*80)

    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.3,
        enable_web_search=False
    )

    # Format research topics for the prompt
    topics_str = "\n".join([
        f"- {topic['topic']} (Stance: {topic['stance']})\n  Rationale: {topic['rationale']}"
        for topic in state['research_topics']
    ])

    # Calculate time context
    market = state['orderbook_data'].get('market', {}).get('market', {})
    close_date_str = market.get('close_time', '')

    days_remaining = None
    time_urgency = "unknown timeframe"

    try:
        if close_date_str:
            close_date = datetime.fromisoformat(close_date_str.replace('Z', '+00:00'))
            days_remaining = (close_date - datetime.now(timezone.utc)).days

            if days_remaining < 30:
                time_urgency = f"ONLY {days_remaining} DAYS LEFT - EXTREMELY TIME-SENSITIVE"
            elif days_remaining < 60:
                time_urgency = f"{days_remaining} days remaining - TIME-SENSITIVE"
            elif days_remaining < 180:
                time_urgency = f"{days_remaining} days remaining"
            else:
                time_urgency = f"{days_remaining} days remaining - long-term outlook"
    except Exception as e:
        print(f"  WARNING: Could not parse close date: {e}")

    print(f"\n⏰ TIME CONTEXT: {time_urgency}")

    prompt = f"""You are generating search queries to find evidence for market prediction analysis.

# MARKET CONTEXT
{state['market_summary']}

# ⚠️  CRITICAL TIME CONTEXT
**{time_urgency}**
**Market closes: {close_date_str}**

The market is asking if the event will happen BEFORE the close date. Your queries MUST focus on:
- Evidence the event will happen in the remaining timeframe
- Recent announcements or concrete plans
- Timeline indicators (upcoming dates, deadlines, schedules)

# RESEARCH TOPICS IDENTIFIED
{topics_str}

# YOUR TASK

Generate 2-3 specific, targeted search queries for EACH perspective:

1. **Bullish Queries** (YES outcome):
   - Focus on CONCRETE EVIDENCE the event will happen BEFORE the close date
   - Look for: announcements, confirmations, planned dates, imminent events
   - Use time-sensitive keywords: "soon", "upcoming", "announced", "confirmed", "plans"
   - For events requiring planning (weddings, etc.) look for active preparation evidence

2. **Bearish Queries** (NO outcome):
   - Focus on evidence the event WON'T happen in time
   - Look for: delays, denials, busy schedules, conflicting commitments
   - Search for lack of concrete plans or preparation
   - Consider realistic timelines for the event type

**CRITICAL FOR TIME-SENSITIVE MARKETS** (< 60 days):
- Bullish queries should look for CONCRETE near-term evidence (engagement announcements, wedding dates set, etc.)
- Bearish queries should look for evidence of inactivity or conflicting schedules
- Avoid generic queries about general relationship status

**REQUIREMENTS**:
- Each query should be 3-10 words
- Include time-sensitive keywords when relevant
- Use names, dates, or specific events when possible
- Avoid duplicate queries between bullish and bearish
- Focus on factual evidence, not speculation

**EXAMPLES FOR TIME-SENSITIVE MARKETS**:

Good bullish query: "Taylor Swift Travis Kelce wedding date announced 2025"
Bad bullish query: "Taylor Swift Travis Kelce relationship"

Good bullish query: "Travis Kelce engagement ring December 2025"
Bad bullish query: "celebrity engagement news"

Good bearish query: "Taylor Swift world tour schedule 2025"
Bad bearish query: "celebrity relationship problems"

Return a JSON object with bullish and bearish query lists.
"""

    structured_llm = llm.with_structured_output(SearchQueries, method="function_calling")
    result = structured_llm.invoke(prompt)

    print("\n" + "-"*80)
    print("RAW OUTPUT:")
    print("-"*80)
    output = {
        "step": 2,
        "step_name": "Generate Queries",
        "step_summary": "Generate search queries for bullish and bearish perspectives",
        "market_ticker": state['market_ticker'],
        "step_output": result.model_dump()
    }
    print(json.dumps(output, indent=2))
    print("-"*80)

    print(f"\nBULLISH QUERIES ({len(result.bullish_queries)}):")
    for i, query in enumerate(result.bullish_queries, 1):
        print(f"{i}. {query}")

    print(f"\nBEARISH QUERIES ({len(result.bearish_queries)}):")
    for i, query in enumerate(result.bearish_queries, 1):
        print(f"{i}. {query}")

    return {
        "bullish_queries": result.bullish_queries,
        "bearish_queries": result.bearish_queries
    }
