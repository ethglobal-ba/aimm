"""
Step 1: Analyze market rules and generate research topics.

This node examines the market title, contract rules, expiration date, and settlement
sources to generate balanced research topics for further investigation.
"""

import json
from datetime import datetime, timezone
from typing import Dict

from ..state import MarketState
from ..models import ResearchTopics
from src.utils.venice_llm import get_venice_llm


def analyze_market_rules(state: MarketState) -> Dict:
    """Step 1: Analyze market rules and generate research topics"""
    print("\n" + "="*80)
    print("STEP 1: Analyzing market rules and generating research topics")
    print("="*80)

    event = state['event_info'].get('event', {}).get('event', {})
    contract = state['event_info'].get('contract', {})
    market = state['orderbook_data'].get('market', {}).get('market', {})

    # Get today's date and expiration date
    today = datetime.now(timezone.utc)
    today_str = today.strftime('%Y-%m-%d')

    close_time_str = market.get('close_time', 'N/A')
    expiration_str = market.get('expected_expiration_time', 'N/A')

    # Calculate days remaining
    days_remaining = "Unknown"
    if close_time_str != 'N/A':
        try:
            close_time = datetime.fromisoformat(close_time_str.replace('Z', '+00:00'))
            days_remaining = (close_time - today).days
        except:
            pass

    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.4,
        enable_web_search=False
    )

    prompt = f"""You are analyzing a prediction market to determine what research topics would help assess the true probability.

# IMPORTANT TIME CONTEXT

**TODAY'S DATE: {today_str}**
**MARKET CLOSES: {close_time_str}**
**DAYS REMAINING: {days_remaining} days**
**EXPIRATION: {expiration_str}**

This is critical context - the market is asking whether the event will happen BEFORE the close date.

# MARKET INFORMATION

Event: {event.get('title', 'N/A')}
Market: {market.get('title', 'N/A')}
Subtitle: {market.get('subtitle', 'N/A')}

## Contract Rules
{contract.get('text', 'Contract rules not available')}

## Settlement Sources
{json.dumps(event.get('settlement_sources', []), indent=2)}

# YOUR TASK

Generate 3-5 specific research topics that would help determine the probability of this market resolving YES.
**Consider the time remaining when generating topics** - focus on what could realistically happen in the timeframe.
IMPORTANT:
- Include topics from BOTH bullish and bearish perspectives for balanced analysis
- Topics should contradict each other to explore different scenarios
- Focus on specific, researchable questions
- Consider recent events, trends, and upcoming catalysts

Return your response as a JSON object with:
- "topics": list of research topics with topic, rationale, and stance
- "summary": overall summary of what needs to be researched
"""

    structured_llm = llm.with_structured_output(ResearchTopics, method="function_calling")
    result = structured_llm.invoke(prompt)

    print("\n" + "-"*80)
    print("RAW OUTPUT:")
    print("-"*80)
    output = {
        "step": 1,
        "step_name": "Analyze Market Rules",
        "step_summary": "Analyze market rules and generate research topics",
        "market_ticker": state['market_ticker'],
        "step_output": result.model_dump()
    }
    print(json.dumps(output, indent=2))
    print("-"*80)

    print(f"\nGenerated {len(result.topics)} research topics:")
    for i, topic in enumerate(result.topics, 1):
        print(f"{i}. [{topic.stance.upper()}] {topic.topic}")
        print(f"   Rationale: {topic.rationale}")

    return {
        "market_summary": result.summary,
        "research_topics": [t.model_dump() for t in result.topics]
    }
