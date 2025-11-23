"""
Step 4: Search web for news articles using bullish and bearish queries.
"""

from typing import Dict, List
import json
from datetime import datetime, timezone

from ..state import MarketState
from ..models import NewsArticle, NewsCollection
from src.utils.venice_llm import get_venice_llm


def validate_news_article(article: Dict, debug: bool = True) -> bool:
    """
    Validate that news article is real and not fabricated.

    Uses simple heuristics instead of maintaining a domain whitelist:
    - Rejects obvious fake URLs (example.com, localhost, etc.)
    - Rejects URLs without proper TLDs
    - Rejects far-future dates (2+ years out)
    - Otherwise trusts the LLM's web search results

    Args:
        article: Article dictionary with source, title, url, timestamp
        debug: Print debug info for rejected articles

    Returns:
        True if article passes validation
    """
    title = article.get('title', 'Unknown')
    url = article.get('url', '').lower()

    # Reject missing URLs or obvious fake domains
    if not url:
        if debug:
            print(f"  DEBUG REJECT [{title}]: No URL")
        return False

    # Reject obvious fake/test URLs
    fake_patterns = ['example.com', 'localhost', '127.0.0.1', 'test.com', 'placeholder']
    if any(pattern in url for pattern in fake_patterns):
        if debug:
            print(f"  DEBUG REJECT [{title}]: Fake/test URL - {url}")
        return False

    # Must have a valid URL structure (http/https with a domain)
    if not url.startswith(('http://', 'https://')):
        if debug:
            print(f"  DEBUG REJECT [{title}]: Invalid URL format - {url}")
        return False

    # Extract domain and check for valid TLD
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        domain = parsed.netloc

        # Must have a domain with at least one dot (e.g., site.com)
        if '.' not in domain:
            if debug:
                print(f"  DEBUG REJECT [{title}]: No TLD in domain - {domain}")
            return False

    except Exception as e:
        if debug:
            print(f"  DEBUG REJECT [{title}]: URL parsing error - {e}")
        return False

    # Timestamp validation - only reject clearly fabricated future dates
    try:
        timestamp = article.get('timestamp', '').lower()
        if timestamp:
            current_year = datetime.now().year

            # Only reject dates that are clearly far in the future (2+ years out)
            far_future_years = [str(current_year + 2), str(current_year + 3), str(current_year + 4)]
            for year in far_future_years:
                if year in timestamp:
                    if debug:
                        print(f"  DEBUG REJECT [{title}]: Far future date ({year}) - {timestamp}")
                    return False

            # Try to parse specific date formats to check if they're reasonable
            parsed_date = None
            for fmt in ['%Y-%m-%d', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M:%SZ', '%b %d, %Y', '%B %Y']:
                try:
                    parsed_date = datetime.strptime(timestamp[:19] if len(timestamp) > 19 else timestamp, fmt)
                    break
                except ValueError:
                    continue

            # If we parsed a specific date and it's > 2 years in future, reject
            if parsed_date:
                two_years_from_now = datetime.now().replace(year=current_year + 2)
                if parsed_date > two_years_from_now:
                    if debug:
                        print(f"  DEBUG REJECT [{title}]: Future date - {timestamp}")
                    return False

    except Exception as e:
        # If we can't validate timestamp, allow it (don't be too strict)
        if debug:
            print(f"  DEBUG WARNING [{title}]: Timestamp validation error - {e}")

    if debug:
        print(f"  DEBUG PASS [{title}]: URL={url[:50]}..., Timestamp={article.get('timestamp', 'N/A')}")
    return True


def search_web_news(state: MarketState) -> Dict:
    """Step 4: Search web for news articles (baseline sentiment)"""
    print("\n" + "="*80)
    print("STEP 4: Searching web news (baseline)")
    print("="*80)

    llm = get_venice_llm(
        model="llama-3.3-70b",
        temperature=0.3,
        enable_web_search=True,
        enable_web_citations=True
    )

    all_articles = []

    # Search bullish queries
    print(f"\nSearching {len(state['bullish_queries'])} bullish queries...")
    for i, query in enumerate(state['bullish_queries'], 1):
        print(f"\n[{i}/{len(state['bullish_queries'])}] Bullish query: {query}")

        prompt = f"""Search for news articles about: {query}

# MARKET CONTEXT
{state['market_summary']}

# YOUR TASK

Find 2-3 REAL, CREDIBLE news articles that are relevant to this query.

**CRITICAL REQUIREMENTS**:
1. **Only include REAL articles** - do not fabricate or hallucinate
2. **Include working URLs** from credible news sources
3. **Dates must be in the PAST** - no future dates
4. **Must be relevant** to the market context
5. **Use web search** to find actual articles with citations

For each article provide:
- source: Name of the publication or Twitter handle
- title: Actual article headline
- content: 1-2 sentence summary of relevant content
- url: Real, working URL to the article
- timestamp: Publication date (MUST be in past)
- relevance: Why this is relevant to the market

Return ONLY real articles you found through web search. If you cannot find credible articles, return an empty list.
"""

        try:
            structured_llm = llm.with_structured_output(NewsCollection, method="function_calling")
            result = structured_llm.invoke(prompt)

            # Validate and filter articles
            valid_articles = []
            for article in result.articles:
                article_dict = article.model_dump()
                if validate_news_article(article_dict):
                    article_dict['search_query'] = query
                    article_dict['query_perspective'] = 'bullish'
                    valid_articles.append(article_dict)
                else:
                    print(f"  REJECTED: {article_dict.get('title', 'Unknown')} - Failed validation")

            all_articles.extend(valid_articles)
            print(f"  Found {len(result.articles)} articles, {len(valid_articles)} valid")

        except Exception as e:
            print(f"  ERROR: {type(e).__name__}: {e}")
            # Continue to next query even if this one fails
            continue

    # Search bearish queries
    print(f"\nSearching {len(state['bearish_queries'])} bearish queries...")
    for i, query in enumerate(state['bearish_queries'], 1):
        print(f"\n[{i}/{len(state['bearish_queries'])}] Bearish query: {query}")

        prompt = f"""Search for news articles about: {query}

# MARKET CONTEXT
{state['market_summary']}

# YOUR TASK

Find 2-3 REAL, CREDIBLE news articles that are relevant to this query.

**CRITICAL REQUIREMENTS**:
1. **Only include REAL articles** - do not fabricate or hallucinate
2. **Include working URLs** from credible news sources
3. **Dates must be in the PAST** - no future dates
4. **Must be relevant** to the market context
5. **Use web search** to find actual articles with citations

For each article provide:
- source: Name of the publication or Twitter handle
- title: Actual article headline
- content: 1-2 sentence summary of relevant content
- url: Real, working URL to the article
- timestamp: Publication date (MUST be in past)
- relevance: Why this is relevant to the market

Return ONLY real articles you found through web search. If you cannot find credible articles, return an empty list.
"""

        try:
            structured_llm = llm.with_structured_output(NewsCollection, method="function_calling")
            result = structured_llm.invoke(prompt)

            # Validate and filter articles
            valid_articles = []
            for article in result.articles:
                article_dict = article.model_dump()
                if validate_news_article(article_dict):
                    article_dict['search_query'] = query
                    article_dict['query_perspective'] = 'bearish'
                    valid_articles.append(article_dict)
                else:
                    print(f"  REJECTED: {article_dict.get('title', 'Unknown')} - Failed validation")

            all_articles.extend(valid_articles)
            print(f"  Found {len(result.articles)} articles, {len(valid_articles)} valid")

        except Exception as e:
            print(f"  ERROR: {type(e).__name__}: {e}")
            # Continue to next query even if this one fails
            continue

    # Deduplicate by URL
    seen_urls = set()
    unique_articles = []
    for article in all_articles:
        url = article.get('url', '')
        if url and url not in seen_urls:
            seen_urls.add(url)
            unique_articles.append(article)

    print("\n" + "-"*80)
    print("RAW OUTPUT:")
    print("-"*80)
    output = {
        "step": 4,
        "step_name": "Search Web News",
        "step_summary": "Search web for credible news articles (baseline sentiment)",
        "market_ticker": state['market_ticker'],
        "step_output": {
            "total_articles_found": len(all_articles),
            "unique_articles": len(unique_articles),
            "articles": unique_articles
        }
    }
    print(json.dumps(output, indent=2))
    print("-"*80)

    print(f"\nFOUND {len(unique_articles)} UNIQUE NEWS ARTICLES:")
    for i, article in enumerate(unique_articles[:5], 1):
        print(f"\n{i}. {article['source']} - {article['title']}")
        print(f"   URL: {article['url']}")
        print(f"   Date: {article['timestamp']}")

    if len(unique_articles) > 5:
        print(f"\n... and {len(unique_articles) - 5} more articles")

    return {
        "web_news": unique_articles
    }
