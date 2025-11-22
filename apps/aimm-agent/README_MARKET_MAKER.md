# Market Maker Agent

Stateful prediction market research agent that analyzes markets and generates orderbook recommendations using LangGraph.

## Features

- **7-Step Analysis Workflow**:
  1. Analyze market rules and generate research topics
  2. Gather news from Twitter (popular + recent) and web articles
  3. Score news sources by credibility, impact, and recency
  4. Calculate fair price from research
  5. Analyze current orderbook
  6. Compare research vs orderbook delta
  7. Generate final order recommendations

- **Two-Phase Twitter Analysis**:
  - **Popular tweets** (high engagement): Baseline sentiment
  - **Recent tweets** (last 6 hours): Delta/shift detection

- **Time-Aware**: Considers market expiration date and days remaining

- **Delta Analysis**: Reconciles research-based pricing with market reality

## Setup

1. Install dependencies:
```bash
cd /Users/dayuzhang/Code/Hackathons/Eth_Global_Buenos_Aires_2025/aimm/apps/agent
poetry install
```

2. Configure environment variables:
```bash
cp .env.market_maker .env
# Edit .env with your API keys
```

Required API keys:
- `VENICE_API_KEY`: Venice AI API key (for LLM with web search)
- `X_API_KEY`: Twitter API key (twitterapi.io)
- Optional: `KALSHI_API_KEY` for authenticated Kalshi API access

## Usage

Run the market maker agent:

```bash
poetry run python src/agents/market_maker_stateful.py
```

By default, it analyzes the Taylor Swift / Travis Kelce marriage market (`KXMARRIAGESWIFTKELCE-25`).

To analyze a different market, edit the `__main__` block in `src/agents/market_maker_stateful.py`:

```python
if __name__ == "__main__":
    result = analyze_market_stateful(
        event_ticker="YOUR_EVENT_TICKER",
        market_ticker="YOUR_MARKET_TICKER"
    )
```

## Output

The agent outputs:
- Real-time progress through all 7 steps
- Final order recommendations (YES/NO bid/ask with sizes)
- Detailed analysis saved to `market_analysis_stateful.json`

Example output:
```
FINAL ORDERS:
YES: Bid 2.00¢ x 30 | Ask 3.00¢ x 30
NO:  Bid 97.00¢ x 30 | Ask 98.00¢ x 30
```

## Architecture

```
src/
├── agents/
│   └── market_maker_stateful.py  # Main LangGraph workflow
├── utils/
│   ├── venice_llm.py             # Venice AI LLM client
│   └── twitter_client.py         # Twitter API client
└── kalshi_api.py                 # Kalshi market data fetcher
```

## Key Components

- **LangGraph StateGraph**: Manages workflow with 7 sequential steps
- **Venice AI**: Llama-3.3-70b with web search for news gathering
- **Twitter API**: Fetches popular (baseline) and recent (delta) tweets
- **Kalshi API**: Fetches market data and orderbook
- **Pydantic Models**: Structured outputs for each workflow step

## How It Works

1. **Baseline from Popular Tweets**: High-engagement tweets establish market consensus
2. **Delta from Recent Tweets**: Very recent tweets (last 6 hours) show sentiment shifts
3. **News Scoring**: Each source scored by credibility (0-10), price impact, spread impact
4. **Fair Price Calculation**: Weighted sum of price impacts from all sources
5. **Delta Reconciliation**: Compares research price vs orderbook, adjusts accordingly
6. **Order Generation**: Competitive market-making orders around final fair price

## Example Analysis

For the Swift/Kelce marriage market (expires Dec 31, 2025):

- **Days Remaining**: 40 days
- **Research Fair Price**: 20¢ (based on bullish news/tweets)
- **Orderbook Mid Price**: 2.5¢ (market consensus)
- **Price Delta**: +17.5¢ (huge discrepancy!)
- **Agent Decision**: Lean towards orderbook (market knows 40 days is too short)
- **Final Fair Price**: 11.25¢ (compromise)

The agent correctly recognizes that despite bullish sentiment, 40 days is insufficient time for a celebrity marriage, so it leans heavily towards the orderbook pricing.