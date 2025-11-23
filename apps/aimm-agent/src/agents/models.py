"""
Pydantic models for structured outputs in the market maker workflow.
"""

from typing import List
from pydantic import BaseModel, Field


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


class SearchQueries(BaseModel):
    """Search queries for bullish and bearish perspectives"""
    bullish_queries: List[str] = Field(..., description="2-3 specific search queries for bullish evidence")
    bearish_queries: List[str] = Field(..., description="2-3 specific search queries for bearish evidence")
    reasoning: str = Field(..., description="Explanation of query strategy")


class DeltaAdjustment(BaseModel):
    """Delta price adjustment from recent tweets"""
    delta_price_adjustment: float = Field(..., description="Price adjustment in cents (can be negative)")
    reasoning: str = Field(..., description="Explanation of why the adjustment is warranted")
    confidence: str = Field(..., description="Confidence level: 'high', 'medium', or 'low'")


class RecalibratedPrice(BaseModel):
    """Bayesian recalibration of baseline price using orderbook as prior"""
    recalibrated_price: float = Field(..., ge=0, le=100, description="Bayesian posterior price in cents")
    recalibrated_spread: float = Field(..., ge=0, description="Adjusted spread based on signal convergence")
    orderbook_weight: float = Field(..., ge=0, le=100, description="Percentage weight given to orderbook")
    baseline_weight: float = Field(..., ge=0, le=100, description="Percentage weight given to baseline")
    reasoning: str = Field(..., description="Detailed explanation of weight allocation")
    confidence_adjustment: str = Field(..., description="How baseline research affects confidence in orderbook")
    recommended_action: str = Field(..., description="TRUST_ORDERBOOK, BLEND_SIGNALS, or TRUST_BASELINE")


class FinalPriceAdjustment(BaseModel):
    """Final price combining baseline, delta, and orderbook"""
    price_delta: float = Field(..., description="Total price adjustment from baseline")
    spread_delta: float = Field(..., description="Spread adjustment")
    delta_explanation: str = Field(..., description="Detailed explanation")
    final_fair_price: float = Field(..., ge=0, le=100, description="Final adjusted fair price")
    final_spread: float = Field(..., ge=0, description="Final adjusted spread")
    lean_towards: str = Field(..., description="'baseline', 'orderbook', or 'balanced'")
