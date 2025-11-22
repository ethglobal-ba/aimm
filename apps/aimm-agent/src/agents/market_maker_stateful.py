"""
Stateful Market Maker Agent using LangGraph
Breaks down market analysis into multiple reasoning steps for better decision making.
"""

import os
import sys
from typing import Dict, List, Optional, TypedDict
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import END, START, StateGraph
import json
from datetime import datetime, timezone

# Add project root to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.utils.venice_llm import get_venice_llm
from src.utils.twitter_client import get_twitter_client
from src.utils.kalshi_api import get_kalshi_event_info, get_kalshi_orderbook

load_dotenv()


# ============================================================================
# STATE MODELS
# ============================================================================

class MarketState(TypedDict):
    """Complete state for market maker workflow"""
    # Input data
    event_ticker: str
    market_ticker: str
    event_info: Dict
    orderbook_data: Dict

    # Step 1: Research topics
    market_summary: str
    research_topics: List[Dict[str, str]]  # [{"topic": str, "rationale": str, "stance": "bullish/bearish"}]

    # Step 2: News gathering
    news_articles: List[Dict]  # [{"source": str, "title": str, "content": str, "url": str, "timestamp": str}]

    # Step 3: News analysis
    news_summary: Dict  # {"bullish": [...], "bearish": [...], "overall_sentiment": str}
    price_impact_scores: List[Dict]  # [{"source": str, "credibility": float, "price_impact": float, "spread_impact": float}]

    # Step 4: Fair price from research
    research_fair_price: float  # 0-100
    research_spread: float  # cents
    research_reasoning: str

    # Step 5: Orderbook analysis
    orderbook_mid_price: float
    orderbook_spread: float
    orderbook_no_mid_price: float
    orderbook_no_spread: float
    orderbook_liquidity: Dict

    # Step 6: Delta analysis
    price_delta: float
    spread_delta: float
    delta_explanation: str
    final_fair_price: float
    final_spread: float

    # Step 7: Final orders
    final_orders: Dict


# ============================================================================
# PYDANTIC MODELS FOR STRUCTURED OUTPUT
# ============================================================================

class ResearchTopic(BaseModel):
    """A topic to research for market analysis"""
    topic: str = Field(..., description="Specific topic to research")
    rationale: str = Field(..., description="Why this topic is relevant")
    stance: str = Field(..., description="Expected stance: 'bullish', 'bearish', or 'neutral'")


class ResearchTopics(BaseModel):
    """Collection of research topics"""
    topics: List[ResearchTopic] = Field(..., description="3-5 research topics covering different angles")
    summary: str = Field(..., description="Summary of what needs to be researched")


class NewsArticle(BaseModel):
    """A news article or tweet"""
    source: str = Field(..., description="Source name (e.g., 'Bloomberg', 'Twitter @username')")
    title: str = Field(..., description="Article title or tweet preview")
    content: str = Field(..., description="Relevant content snippet")
    url: str = Field(..., description="URL to source")
    timestamp: str = Field(..., description="Publication timestamp")
    relevance: str = Field(..., description="Why this is relevant to the market")


class NewsCollection(BaseModel):
    """Collection of news articles"""
    articles: List[NewsArticle] = Field(..., description="Gathered news articles and tweets")


class SourceScore(BaseModel):
    """Impact score for a news source"""
    source: str = Field(..., description="Source identifier")
    credibility: float = Field(..., ge=0, le=10, description="Credibility score 0-10")
    price_impact: float = Field(..., description="Expected price impact in cents (can be negative)")
    spread_impact: float = Field(..., ge=0, description="Impact on spread in cents")
    recency_weight: float = Field(..., ge=0, le=1, description="Weight based on recency (1=very recent)")
    reasoning: str = Field(..., description="Explanation of the scoring")


class NewsSummary(BaseModel):
    """Summary of news analysis"""
    bullish_articles: List[str] = Field(..., description="List of bullish article titles/sources")
    bearish_articles: List[str] = Field(..., description="List of bearish article titles/sources")
    overall_sentiment: str = Field(..., description="Overall sentiment: 'bullish', 'bearish', or 'neutral'")
    source_scores: List[SourceScore] = Field(..., description="Detailed scoring for each source")
    confidence: str = Field(..., description="Confidence level: 'high', 'medium', or 'low'")


class FairPriceEstimate(BaseModel):
    """Fair price estimate from research"""
    fair_price: float = Field(..., ge=0, le=100, description="Fair YES price in cents")
    recommended_spread: float = Field(..., ge=0, description="Recommended spread in cents")
    reasoning: str = Field(..., description="Detailed reasoning for the estimate")
    key_factors: List[str] = Field(..., description="Key factors influencing the price")


class OrderbookAnalysis(BaseModel):
    """Analysis of current orderbook"""
    yes_mid_price: float = Field(..., description="Mid price on YES side")
    no_mid_price: float = Field(..., description="Mid price on NO side")
    yes_spread: float = Field(..., description="Spread on YES side")
    no_spread: float = Field(..., description="Spread on NO side")
    depth_analysis: str = Field(..., description="Analysis of orderbook depth and liquidity")


class DeltaAnalysis(BaseModel):
    """Analysis of price delta between research and orderbook"""
    price_delta: float = Field(..., description="Difference between research price and orderbook mid")
    spread_delta: float = Field(..., description="Difference in spreads")
    delta_makes_sense: bool = Field(..., description="Whether the delta is justified by research")
    explanation: str = Field(..., description="Detailed explanation of the delta")
    final_fair_price: float = Field(..., ge=0, le=100, description="Adjusted fair price")
    final_spread: float = Field(..., ge=0, description="Adjusted spread")
    lean_towards: str = Field(..., description="'research' or 'orderbook' - which to lean towards")


class FinalOrders(BaseModel):
    """Final order recommendations"""
    yes_bid: float = Field(..., description="YES bid price in cents")
    yes_bid_size: int = Field(..., description="YES bid quantity")
    yes_ask: float = Field(..., description="YES ask price in cents")
    yes_ask_size: int = Field(..., description="YES ask quantity")
    no_bid: float = Field(..., description="NO bid price in cents")
    no_bid_size: int = Field(..., description="NO bid quantity")
    no_ask: float = Field(..., description="NO ask price in cents")
    no_ask_size: int = Field(..., description="NO ask quantity")
    reasoning: str = Field(..., description="Overall strategy explanation")


# ============================================================================
# WORKFLOW NODES
# ============================================================================

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

    print(f"\nGenerated {len(result.topics)} research topics:")
    for i, topic in enumerate(result.topics, 1):
        print(f"{i}. [{topic.stance.upper()}] {topic.topic}")
        print(f"   Rationale: {topic.rationale}")

    return {
        "market_summary": result.summary,
        "research_topics": [t.model_dump() for t in result.topics]
    }


def gather_news(state: MarketState) -> Dict:
    """Step 2: Gather news, tweets, and articles for research topics"""
    print("\n" + "="*80)
    print("STEP 2: Gathering news and tweets")
    print("="*80)

    # Extract market info to build search queries
    market = state['orderbook_data'].get('market', {}).get('market', {})
    market_title = market.get('title', '')

    # Get Twitter client and search for tweets
    all_tweets = []
    popular_tweets = []
    recent_tweets = []

    try:
        twitter_client = get_twitter_client()

        # Build search query from market title
        # For "Will Taylor Swift and Travis Kelce be married in 2025?"
        # -> "Taylor Swift Travis Kelce"
        import re
        # Extract main entities from title
        words = market_title.split()
        # Remove common question words
        stop_words = {'will', 'be', 'in', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did'}
        search_terms = [w for w in words if w.lower() not in stop_words and len(w) > 2]
        search_query = ' '.join(search_terms[:5])  # Take first 5 relevant words

        print(f"\nSearching Twitter for: '{search_query}'")

        # Phase 1: Get TOP tweets (high engagement) for baseline sentiment
        print("  Phase 1: Fetching popular tweets (high engagement)...")
        top_result = twitter_client.search_tweets(
            query=search_query,
            query_type='Top',  # Get most popular tweets
            max_results=30
        )

        top_tweets_raw = twitter_client.format_tweets_for_analysis(top_result.get('tweets', []))

        # Filter for tweets with significant engagement (views > 1000 OR likes > 10)
        popular_tweets = [
            t for t in top_tweets_raw
            if t.get('views', 0) > 1000 or t.get('likes', 0) > 10
        ]

        # Sort by engagement score (views + likes*100 + retweets*50)
        popular_tweets.sort(
            key=lambda t: t.get('views', 0) + t.get('likes', 0)*100 + t.get('retweets', 0)*50,
            reverse=True
        )
        popular_tweets = popular_tweets[:15]  # Take top 15 by engagement

        print(f"    Found {len(popular_tweets)} high-engagement tweets")
        if popular_tweets:
            top_tweet = popular_tweets[0]
            print(f"    Top tweet: {top_tweet.get('likes', 0)} likes, {top_tweet.get('views', 0)} views")

        # Phase 2: Get LATEST tweets (very recent) for delta analysis
        print("  Phase 2: Fetching very recent tweets (last few hours)...")
        latest_result = twitter_client.search_tweets(
            query=search_query,
            query_type='Latest',  # Get most recent tweets
            max_results=30
        )

        recent_tweets_raw = twitter_client.format_tweets_for_analysis(latest_result.get('tweets', []))

        # Parse timestamps and filter for tweets from last 10 minutes
        from datetime import timedelta
        now = datetime.now(timezone.utc)
        cutoff_time = now - timedelta(minutes=10)

        recent_tweets = []
        for t in recent_tweets_raw:
            timestamp_str = t.get('timestamp', '')
            try:
                # Parse Twitter timestamp format: "Sat Nov 22 18:59:00 +0000 2025"
                tweet_time = datetime.strptime(timestamp_str, '%a %b %d %H:%M:%S %z %Y')
                if tweet_time >= cutoff_time:
                    recent_tweets.append(t)
            except:
                # If we can't parse, include it anyway
                recent_tweets.append(t)

        recent_tweets = recent_tweets[:15]  # Take top 15 most recent
        print(f"    Found {len(recent_tweets)} very recent tweets (last 10 minutes)")

        # Combine both sets
        all_tweets = popular_tweets + recent_tweets
        print(f"\n  Total tweets: {len(all_tweets)} ({len(popular_tweets)} popular + {len(recent_tweets)} recent)")

    except Exception as e:
        print(f"Warning: Could not fetch tweets: {e}")
        all_tweets = []
        popular_tweets = []
        recent_tweets = []

    # Also use LLM with web search for news articles
    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.3,
        enable_web_search=True,
        enable_web_scraping=True,
        enable_web_citations=True
    )

    topics_summary = "\n".join([
        f"- {t['topic']} (stance: {t['stance']})"
        for t in state['research_topics']
    ])

    prompt = f"""You are gathering recent NEWS ARTICLES about a prediction market.

# MARKET
{state['market_summary']}

# RESEARCH TOPICS
{topics_summary}

# YOUR TASK

Search for RECENT NEWS ARTICLES (not tweets) from the last 24-48 hours.

PRIORITIES:
1. **Recency**: Focus on news from the last 24-48 hours
2. **Credibility**: Prioritize official sources, major news outlets
3. **Relevance**: Only include information directly related to the market outcome
4. **Balance**: Try to find sources for both bullish AND bearish perspectives

For news articles:
- Check major news outlets (CNN, BBC, Reuters, AP, etc.)
- Look for official announcements
- Verify publication dates

Return a JSON object with an "articles" array containing:
- source: Source name
- title: Article title
- content: Relevant content snippet (keep it concise)
- url: URL to source
- timestamp: Publication time
- relevance: Why this matters for the market
"""

    structured_llm = llm.with_structured_output(NewsCollection, method="function_calling")
    result = structured_llm.invoke(prompt)

    # Add metadata to tweets to distinguish popular vs recent
    for tweet in popular_tweets:
        tweet['tweet_type'] = 'popular'  # For baseline pricing

    for tweet in recent_tweets:
        tweet['tweet_type'] = 'recent'  # For delta adjustment

    # Combine tweets and articles
    news_articles = all_tweets + [a.model_dump() for a in result.articles]

    print(f"\nGathered {len(news_articles)} total sources:")
    print(f"  - {len(popular_tweets)} popular tweets (baseline)")
    print(f"  - {len(recent_tweets)} recent tweets (delta)")
    print(f"  - {len(result.articles)} news articles")

    for article in news_articles[:5]:  # Show first 5
        source = article.get('source', 'Unknown')
        title = article.get('title', '')[:60]
        tweet_type = article.get('tweet_type', '')
        type_label = f" [{tweet_type}]" if tweet_type else ""
        print(f"- {source}{type_label}: {title}...")

    return {
        "news_articles": news_articles
    }


def summarize_and_score(state: MarketState) -> Dict:
    """Step 3: Summarize news and assign impact scores"""
    print("\n" + "="*80)
    print("STEP 3: Summarizing news and scoring impact")
    print("="*80)

    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.3,
        enable_web_search=False
    )

    articles_summary = "\n\n".join([
        f"Source: {a['source']}\n"
        f"Type: {a.get('tweet_type', 'news')}\n"
        f"Title: {a['title']}\n"
        f"Content: {a['content']}\n"
        f"Timestamp: {a['timestamp']}\n"
        f"Engagement: Likes={a.get('likes', 'N/A')}, Views={a.get('views', 'N/A')}, Retweets={a.get('retweets', 'N/A')}\n"
        f"URL: {a['url']}"
        for a in state['news_articles']
    ])

    prompt = f"""You are analyzing news sources to determine their impact on a prediction market price.

# MARKET
{state['market_summary']}

# GATHERED NEWS

We have TWO types of Twitter data:
1. **POPULAR tweets** (high engagement): Use these for BASELINE sentiment - they represent established consensus
2. **RECENT tweets** (last 6 hours): Use these for DELTA - they show if sentiment is shifting

{articles_summary}

# YOUR TASK

Analyze each news source and:
1. Categorize as bullish or bearish
2. Assess credibility (0-10 scale)
3. Estimate price impact in cents (can be positive or negative)
4. Estimate spread impact (uncertainty adds to spread)
5. Weight by recency (very recent = 1.0, older = lower)

CRITICAL DISTINCTION:
- **Popular tweets** (Type: popular): These have high views/likes. Weight them MORE heavily as they represent established market sentiment
- **Recent tweets** (Type: recent): These are very new (last 6 hours). Weight them LESS unless they have high engagement or come from credible sources
- **News articles** (Type: news): Weight by source credibility

SCORING GUIDELINES:
- **Credibility**:
  - Official sources/Verified major accounts = 9-10
  - Major news outlets = 7-8
  - Popular tweets (>10k views) = 5-7
  - Recent low-engagement tweets = 2-4
  - Unknown sources = 1-3
- **Price Impact**: Strong evidence = ±5-10 cents, Moderate = ±2-5, Weak = ±0.5-2
- **Spread Impact**: High uncertainty = +3-5 cents, Medium = +1-3, Low = +0.5-1
- **Recency**: Last hour = 1.0, Last 6 hours = 0.8, Last 24h = 0.6, Older = 0.3

If you find credible sources on BOTH sides, this increases uncertainty and should increase spread.

Return a JSON object with:
- bullish_articles: List of bullish sources
- bearish_articles: List of bearish sources
- overall_sentiment: Overall sentiment
- source_scores: Detailed scores for each source
- confidence: Your confidence level in the analysis
"""

    structured_llm = llm.with_structured_output(NewsSummary, method="function_calling")
    result = structured_llm.invoke(prompt)

    print(f"\nSentiment: {result.overall_sentiment.upper()}")
    print(f"Bullish sources: {len(result.bullish_articles)}")
    print(f"Bearish sources: {len(result.bearish_articles)}")
    print(f"Confidence: {result.confidence}")

    return {
        "news_summary": result.model_dump(),
        "price_impact_scores": [s.model_dump() for s in result.source_scores]
    }


def calculate_fair_price(state: MarketState) -> Dict:
    """Step 4: Calculate fair price and spread from research"""
    print("\n" + "="*80)
    print("STEP 4: Calculating fair price from research")
    print("="*80)

    # Get time context
    market = state['orderbook_data'].get('market', {}).get('market', {})
    today = datetime.now(timezone.utc)
    today_str = today.strftime('%Y-%m-%d')
    close_time_str = market.get('close_time', 'N/A')

    days_remaining = "Unknown"
    if close_time_str != 'N/A':
        try:
            close_time = datetime.fromisoformat(close_time_str.replace('Z', '+00:00'))
            days_remaining = (close_time - today).days
        except:
            pass

    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.3,
        enable_web_search=False
    )

    scores_summary = "\n".join([
        f"- {s['source']}: credibility={s['credibility']}/10, "
        f"price_impact={s['price_impact']:+.1f}¢, "
        f"spread_impact={s['spread_impact']:+.1f}¢, "
        f"recency_weight={s['recency_weight']:.2f}"
        for s in state['price_impact_scores']
    ])

    prompt = f"""You are calculating a fair price estimate based on news analysis.

# IMPORTANT TIME CONTEXT
**TODAY: {today_str}**
**MARKET CLOSES: {close_time_str}**
**DAYS REMAINING: {days_remaining} days**

This market is asking if the event will happen BEFORE {close_time_str}.
Consider the realistic probability given the time remaining.

# MARKET
{state['market_summary']}

# NEWS SUMMARY
Overall Sentiment: {state['news_summary']['overall_sentiment']}
Confidence: {state['news_summary']['confidence']}

Bullish Sources ({len(state['news_summary']['bullish_articles'])}):
{chr(10).join(['- ' + s for s in state['news_summary']['bullish_articles'][:5]])}

Bearish Sources ({len(state['news_summary']['bearish_articles'])}):
{chr(10).join(['- ' + s for s in state['news_summary']['bearish_articles'][:5]])}

# SOURCE SCORES
{scores_summary}

# YOUR TASK

Calculate a fair price and recommended spread based on the research.

CRITICAL: Consider the time remaining! For events like marriages that require planning,
{days_remaining} days may be very short or very long. Adjust your probability accordingly.

METHODOLOGY:
1. Start with a baseline probability considering time remaining
2. Apply weighted price impacts from each source (weight by credibility × recency)
3. Sum the impacts to get final fair price
4. Calculate spread based on:
   - Sum of spread impacts from sources
   - Confidence level (low confidence = wider spread)
   - Contradicting evidence (more contradiction = wider spread)

Show your math clearly in the reasoning field.

Return a JSON object with:
- fair_price: Fair YES price in cents (0-100)
- recommended_spread: Recommended spread in cents
- reasoning: Step-by-step calculation
- key_factors: Key factors influencing the price
"""

    structured_llm = llm.with_structured_output(FairPriceEstimate, method="function_calling")
    result = structured_llm.invoke(prompt)

    print(f"\nResearch Fair Price: {result.fair_price:.2f}¢")
    print(f"Recommended Spread: {result.recommended_spread:.2f}¢")

    return {
        "research_fair_price": result.fair_price,
        "research_spread": result.recommended_spread,
        "research_reasoning": result.reasoning
    }


def analyze_orderbook(state: MarketState) -> Dict:
    """Step 5: Analyze current orderbook"""
    print("\n" + "="*80)
    print("STEP 5: Analyzing current orderbook")
    print("="*80)

    market = state['orderbook_data'].get('market', {}).get('market', {})
    orderbook = state['orderbook_data'].get('orderbook', {}).get('orderbook', {})

    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.3,
        enable_web_search=False
    )

    # Format orderbook
    yes_orders = orderbook.get('yes', [])[:10]
    no_orders = orderbook.get('no', [])[:10]

    yes_orders_str = "\n".join([
        f"  Price: {o[0]}¢, Quantity: {o[1]}"
        for o in yes_orders if isinstance(o, (list, tuple)) and len(o) >= 2
    ])

    no_orders_str = "\n".join([
        f"  Price: {o[0]}¢, Quantity: {o[1]}"
        for o in no_orders if isinstance(o, (list, tuple)) and len(o) >= 2
    ])

    prompt = f"""You are analyzing a prediction market orderbook.

# CURRENT MARKET STATE
YES Bid: {market.get('yes_bid', 'N/A')}¢
YES Ask: {market.get('yes_ask', 'N/A')}¢
NO Bid: {market.get('no_bid', 'N/A')}¢
NO Ask: {market.get('no_ask', 'N/A')}¢
Last Price: {market.get('last_price', 'N/A')}¢
Volume (24h): {market.get('volume_24h', 'N/A')}
Open Interest: {market.get('open_interest', 'N/A')}

# ORDERBOOK

YES Orders:
{yes_orders_str}

NO Orders:
{no_orders_str}

# YOUR TASK

Calculate:
1. Mid price for YES side (average of best bid and ask)
2. Mid price for NO side
3. Spread for YES side (ask - bid)
4. Spread for NO side
5. Analyze the depth and liquidity

Return a JSON object with the orderbook analysis.
"""

    structured_llm = llm.with_structured_output(OrderbookAnalysis, method="function_calling")
    result = structured_llm.invoke(prompt)

    print(f"\nOrderbook YES Mid: {result.yes_mid_price:.2f}¢")
    print(f"Orderbook YES Spread: {result.yes_spread:.2f}¢")
    print(f"Orderbook NO Mid: {result.no_mid_price:.2f}¢")
    print(f"Orderbook NO Spread: {result.no_spread:.2f}¢")

    return {
        "orderbook_mid_price": result.yes_mid_price,
        "orderbook_spread": result.yes_spread,
        "orderbook_no_mid_price": result.no_mid_price,
        "orderbook_no_spread": result.no_spread,
        "orderbook_liquidity": result.model_dump()
    }


def compare_and_adjust(state: MarketState) -> Dict:
    """Step 6: Compare research price vs orderbook and adjust"""
    print("\n" + "="*80)
    print("STEP 6: Comparing research vs orderbook and adjusting")
    print("="*80)

    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.3,
        enable_web_search=False
    )

    # Get most recent news for context
    recent_news = sorted(
        state['news_articles'],
        key=lambda x: x.get('timestamp', ''),
        reverse=True
    )[:3]

    recent_news_str = "\n".join([
        f"- {n['source']} ({n['timestamp']}): {n['title']}"
        for n in recent_news
    ])

    prompt = f"""You are reconciling research-based pricing with current orderbook pricing.

# RESEARCH-BASED PRICING
Fair Price from Research: {state['research_fair_price']:.2f}¢
Recommended Spread: {state['research_spread']:.2f}¢
Reasoning: {state['research_reasoning']}

# ORDERBOOK PRICING
Orderbook YES Mid Price: {state['orderbook_mid_price']:.2f}¢
Orderbook YES Spread: {state['orderbook_spread']:.2f}¢
Orderbook NO Mid Price: {state['orderbook_no_mid_price']:.2f}¢
Orderbook NO Spread: {state['orderbook_no_spread']:.2f}¢

# DELTA
Price Delta: {state['research_fair_price'] - state['orderbook_mid_price']:.2f}¢
Spread Delta: {state['research_spread'] - state['orderbook_spread']:.2f}¢

# MOST RECENT NEWS (last 3)
{recent_news_str}

# NEWS SUMMARY
Overall Sentiment: {state['news_summary']['overall_sentiment']}
Confidence: {state['news_summary']['confidence']}

# YOUR TASK

Analyze whether the delta between research price and orderbook price makes sense:

**ORDERBOOK THICKNESS MATTERS:**
- **Thick orderbook** (low spread <1¢, many orders): Market is liquid and efficient
  - If orderbook is thick, assume it already reflects recent information
  - Only deviate from orderbook if news is <10 minutes old
- **Thin orderbook** (wide spread >2¢, few orders): Market is illiquid
  - Orderbook may be stale, lean more towards research

1. **Large Delta + Strong Recent News (<10 mins) + Thin Orderbook**: Lean towards research price
   - Very recent credible news justifies the move
   - Illiquid market hasn't updated yet
   - Apply the delta to orderbook price

2. **Large Delta + Weak/Old News (>10 mins) OR Thick Orderbook**: Lean towards orderbook price
   - If orderbook is thick (tight spread, deep), it already has the information baked in
   - If news is older than 10 minutes, market has already reacted
   - Market knows something we don't
   - Discount the research price heavily towards orderbook

3. **Small Delta**: Take weighted average

Determine:
- Does the delta make sense given the news recency AND orderbook thickness?
- Should we lean towards research or orderbook?
- What's the final adjusted fair price and spread?

Return a JSON object with delta analysis and final adjusted prices.
"""

    structured_llm = llm.with_structured_output(DeltaAnalysis, method="function_calling")
    result = structured_llm.invoke(prompt)

    print(f"\nPrice Delta: {result.price_delta:+.2f}¢")
    print(f"Delta Makes Sense: {result.delta_makes_sense}")
    print(f"Lean Towards: {result.lean_towards.upper()}")
    print(f"Final Fair Price: {result.final_fair_price:.2f}¢")
    print(f"Final Spread: {result.final_spread:.2f}¢")

    return {
        "price_delta": result.price_delta,
        "spread_delta": result.spread_delta,
        "delta_explanation": result.explanation,
        "final_fair_price": result.final_fair_price,
        "final_spread": result.final_spread
    }


def generate_final_orders(state: MarketState) -> Dict:
    """Step 7: Generate final order recommendations"""
    print("\n" + "="*80)
    print("STEP 7: Generating final order recommendations")
    print("="*80)

    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.3,
        enable_web_search=False
    )

    prompt = f"""You are generating final market-making orders.

# FINAL PRICING
Fair Price: {state['final_fair_price']:.2f}¢
Recommended Spread: {state['final_spread']:.2f}¢

# CURRENT ORDERBOOK
YES Mid Price: {state['orderbook_mid_price']:.2f}¢
YES Spread: {state['orderbook_spread']:.2f}¢
NO Mid Price: {state['orderbook_no_mid_price']:.2f}¢
NO Spread: {state['orderbook_no_spread']:.2f}¢

# YOUR TASK

Generate competitive market-making orders:

1. **Calculate YES orders**:
   - YES Bid = Fair Price - (Spread / 2)
   - YES Ask = Fair Price + (Spread / 2)

2. **Calculate NO orders** (remembering YES + NO = 100):
   - NO Bid = 100 - YES Ask
   - NO Ask = 100 - YES Bid

3. **Determine position sizes**:
   - Higher confidence = larger sizes (50-100 contracts)
   - Medium confidence = medium sizes (20-50 contracts)
   - Lower confidence = smaller sizes (5-20 contracts)
   - Consider orderbook liquidity on BOTH sides
   - For low-probability events (YES < 10¢), NO side often has more volume
   - Consider placing larger sizes on NO if that's where the market activity is

4. **Ensure competitiveness**:
   - Compare your YES orders to current YES orderbook (mid/spread)
   - Compare your NO orders to current NO orderbook (mid/spread)
   - Your orders should be competitive on BOTH sides
   - Don't cross the market (bid > ask)
   - For low-probability events, prioritize competitive NO pricing

Return a JSON object with final order recommendations for both YES and NO sides.
"""

    structured_llm = llm.with_structured_output(FinalOrders, method="function_calling")
    result = structured_llm.invoke(prompt)

    print(f"\nFINAL ORDERS:")
    print(f"YES: Bid {result.yes_bid:.2f}¢ x {result.yes_bid_size} | Ask {result.yes_ask:.2f}¢ x {result.yes_ask_size}")
    print(f"NO:  Bid {result.no_bid:.2f}¢ x {result.no_bid_size} | Ask {result.no_ask:.2f}¢ x {result.no_ask_size}")

    return {
        "final_orders": result.model_dump()
    }


# ============================================================================
# BUILD WORKFLOW
# ============================================================================

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


def analyze_market_stateful(event_ticker: str, market_ticker: str):
    """
    Analyze a market using the stateful workflow.

    Args:
        event_ticker: Kalshi event ticker
        market_ticker: Kalshi market ticker

    Returns:
        Complete state with all analysis steps
    """
    print("="*80)
    print("STATEFUL MARKET MAKER ANALYSIS")
    print("="*80)
    print(f"Event: {event_ticker}")
    print(f"Market: {market_ticker}")
    print("="*80)

    # Fetch market data
    print("\nFetching market data...")
    event_info = get_kalshi_event_info(event_ticker, fetch_contract=True)
    orderbook_data = get_kalshi_orderbook(market_ticker)

    if not event_info or not orderbook_data:
        print("Failed to fetch market data")
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
        event_ticker="KXMARRIAGESWIFTKELCE-25",
        market_ticker="KXMARRIAGESWIFTKELCE-25"
    )

    if result:
        # Save detailed results
        with open("market_analysis_stateful.json", "w") as f:
            # Convert to JSON-serializable format
            json_result = {
                k: v for k, v in result.items()
                if k not in ['event_info', 'orderbook_data']  # Skip large objects
            }
            json.dump(json_result, f, indent=2)
        print("\n✅ Detailed results saved to market_analysis_stateful.json")