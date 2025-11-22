# Claude Code Session Handoff

## What Was Done

Successfully integrated a stateful prediction market research agent into the AIMM monorepo at `/Users/dayuzhang/Code/Hackathons/Eth_Global_Buenos_Aires_2025/aimm/apps/agent`.

## Files Created/Modified

### New Files Added

1. **`src/agents/market_maker_stateful.py`** (948 lines)
   - Main LangGraph workflow with 7-step analysis pipeline
   - Uses Venice AI (Llama-3.3-70b) with web search
   - Implements two-phase Twitter analysis (popular + recent tweets)
   - Analyzes Kalshi prediction markets and generates order recommendations

2. **`src/utils/venice_llm.py`**
   - Venice AI client wrapper
   - Supports web search, web scraping, and citations
   - Returns ChatOpenAI-compatible LLM instance

3. **`src/utils/twitter_client.py`**
   - Twitter API client using twitterapi.io
   - Methods:
     - `search_tweets(query, query_type='Latest'|'Top')` - Search tweets
     - `format_tweets_for_analysis()` - Format for market analysis
   - Extracts engagement metrics (likes, views, retweets)

4. **`src/kalshi_api.py`**
   - Kalshi prediction market API client
   - Functions:
     - `get_kalshi_event_info(ticker)` - Fetch event/market data
     - `get_kalshi_orderbook(ticker)` - Fetch orderbook data
   - Works without authentication for public data

5. **`src/__init__.py`**, **`src/agents/__init__.py`**, **`src/utils/__init__.py`**
   - Empty init files for Python package structure

6. **`.env.market_maker`**
   - Environment variables template
   - Required keys:
     - `VENICE_API_KEY` - Venice AI API key
     - `X_API_KEY` - Twitter API key (twitterapi.io)
     - `KALSHI_BASE_URL` - Kalshi API base URL
     - Optional: `LANGSMITH_API_KEY` for tracing

7. **`src/README_MARKET_MAKER.md`**
   - Comprehensive documentation
   - Setup instructions, architecture, usage examples

### Modified Files

1. **`pyproject.toml`**
   - Added dependencies:
     ```toml
     langgraph = "^1.0.3"
     langsmith = "^0.4.45"
     langchain-core = "^1.1.0"
     langchain-openai = "^1.0.3"
     pydantic = "^2.12.4"
     ```

## How the Agent Works

### 7-Step Workflow (LangGraph StateGraph)

1. **Analyze Market Rules**
   - Reads market title, rules, expiration date, settlement sources
   - **Time-aware**: Calculates days remaining until expiration
   - Generates 3-5 contradictory research topics (bullish/bearish)

2. **Gather News & Tweets** (Two-Phase Approach)
   - **Phase 1 - Popular Tweets** (baseline sentiment):
     - Fetches top tweets with high engagement (views > 1000 OR likes > 10)
     - Sorts by engagement score: `views + likes*100 + retweets*50`
     - Takes top 15 tweets
   - **Phase 2 - Recent Tweets** (delta/shift detection):
     - Fetches latest tweets from last 6 hours
     - Takes 15 most recent
   - Also fetches news articles via LLM web search

3. **Score Sources**
   - Each source scored by:
     - **Credibility** (0-10): Official=9-10, Major news=7-8, Popular tweets=5-7, Recent low-engagement=2-4
     - **Price Impact** (±cents): Strong=±5-10¢, Moderate=±2-5¢, Weak=±0.5-2¢
     - **Spread Impact** (cents): High=+3-5¢, Medium=+1-3¢, Low=+0.5-1¢
     - **Recency Weight** (0-1): Last hour=1.0, Last 6h=0.8, Last 24h=0.6, Older=0.3

4. **Calculate Fair Price from Research**
   - Baseline probability considering time remaining
   - Weighted sum of price impacts (credibility × recency)
   - Spread from sum of spread impacts + confidence level

5. **Analyze Current Orderbook**
   - Calculates mid-price: (bid + ask) / 2
   - Calculates spread: ask - bid
   - Analyzes liquidity and depth

6. **Compare & Adjust (Delta Analysis)**
   - Compares research price vs orderbook price
   - **Key Logic**:
     - Large delta + strong recent news → Lean towards research
     - Large delta + weak/no recent news → Lean towards orderbook (market knows something)
     - Small delta → Take weighted average
   - Outputs final adjusted price and spread

7. **Generate Final Orders**
   - YES Bid = Fair Price - (Spread / 2)
   - YES Ask = Fair Price + (Spread / 2)
   - NO Bid = 100 - YES Ask
   - NO Ask = 100 - YES Bid
   - Position sizes based on confidence

## Key Insights from Testing

Tested on `KXMARRIAGESWIFTKELCE-25` (Taylor Swift / Travis Kelce marriage market):

- **Market Details**:
  - Closes: Dec 31, 2025 (40 days remaining from Nov 22)
  - Current price: 2¢ YES

- **Agent Analysis**:
  - Found 8 high-engagement tweets (top: 59M views)
  - Found 15 recent tweets (last 6 hours)
  - Research fair price: 20¢ (bullish sentiment from news/tweets)
  - Orderbook mid: 2.5¢
  - **Price delta: +17.5¢** (huge discrepancy!)

- **Agent Decision**:
  - Recognized delta doesn't make sense
  - Leaned towards orderbook (40 days too short for celebrity marriage)
  - Final fair price: 11.25¢ (compromise)
  - **Final orders**: YES Bid 8.38¢ × 30 | Ask 14.12¢ × 30

## Current Status

✅ All files copied and working
✅ Dependencies updated in pyproject.toml
✅ Import paths fixed for monorepo structure
✅ Tested and running successfully
✅ Documentation complete

## Next Steps

1. **Install dependencies** in monorepo:
   ```bash
   cd /Users/dayuzhang/Code/Hackathons/Eth_Global_Buenos_Aires_2025/aimm/apps/agent
   poetry install
   ```

2. **Configure environment**:
   ```bash
   cp .env.market_maker .env
   # Edit .env and add your API keys:
   # - VENICE_API_KEY
   # - X_API_KEY
   ```

3. **Test the agent**:
   ```bash
   poetry run python src/agents/market_maker_stateful.py
   ```

4. **Integration options**:
   - Create Flask API endpoints to expose the agent
   - Integrate with Web3 contracts for automated trading
   - Add event-driven monitoring for continuous analysis
   - Connect to existing AIMM infrastructure

## Important Notes

- **Import paths**: Updated to use `src.` prefix (e.g., `from src.utils.venice_llm import get_venice_llm`)
- **Twitter API**: Uses twitterapi.io (not official Twitter API), requires `X_API_KEY`
- **Venice AI**: Uses Llama-3.3-70b with web search enabled
- **Kalshi API**: Works without auth for public data, but can add `KALSHI_API_KEY` for authenticated access
- **Output file**: Agent saves results to `market_analysis_stateful.json`

## API Keys Needed

```bash
# Required
VENICE_API_KEY=your_venice_api_key_here
X_API_KEY=your_twitter_api_key_here

# Optional
KALSHI_API_KEY=your_kalshi_api_key_here
LANGSMITH_API_KEY=your_langsmith_api_key_here
```

## Source Code Location

Original development repo: `/Users/dayuzhang/Code/Hackathons/Eth_Global_Buenos_Aires_2025/niche_market_research_agent`

Integrated into monorepo: `/Users/dayuzhang/Code/Hackathons/Eth_Global_Buenos_Aires_2025/aimm/apps/agent`

## Questions to Address

1. How should this integrate with the existing Flask app in `app.py`?
2. Should we create API endpoints for the market maker?
3. Do we need to persist state/results in a database?
4. Should we add automated scheduling for continuous market monitoring?
5. How does this connect to the Web3 contracts?

---

**Session ended**: Ready for next agent to pick up and continue integration work.