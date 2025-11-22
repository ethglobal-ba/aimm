import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Kalshi market tickers
KALSHI_RATE_CUTS_2025_TICKER = "KXRATECUTCOUNT-25DEC31"
KALSHI_SWIFT_KELCE_TICKER = "KXMARRIAGESWIFTKELCE-25"


def get_contract_pdf_text(series_ticker):
    """
    Fetch the contract terms PDF for a series and extract text
    """
    # Kalshi stores contract PDFs at this S3 bucket with the series ticker
    pdf_url = f"https://kalshi-public-docs.s3.amazonaws.com/contract_terms/{series_ticker}.pdf"

    print(f"\nAttempting to fetch contract PDF...")
    print(f"URL: {pdf_url}")
    print("-" * 70)

    try:
        response = requests.get(pdf_url)
        response.raise_for_status()

        print(f"✓ PDF found! Size: {len(response.content)} bytes")
        print(f"To view the full contract, download from: {pdf_url}")

        # Try to extract text from PDF if pypdf is available
        try:
            from pypdf import PdfReader
            from io import BytesIO

            pdf_file = BytesIO(response.content)
            reader = PdfReader(pdf_file)

            print(f"\n{'=' * 70}")
            print(f"CONTRACT TERMS (Extracted from PDF)")
            print(f"{'=' * 70}")
            print(f"Pages: {len(reader.pages)}\n")

            # Extract text from all pages
            full_text = ""
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                full_text += text + "\n"

            print(full_text)

            return {
                "pdf_url": pdf_url,
                "text": full_text,
                "num_pages": len(reader.pages)
            }

        except ImportError:
            print("\nNote: Install 'pypdf' to extract text from PDF")
            print("Run: pip install pypdf")
            print(f"\nYou can download the PDF manually from: {pdf_url}")

            return {
                "pdf_url": pdf_url,
                "text": None,
                "note": "pypdf not installed"
            }

    except requests.exceptions.RequestException as e:
        print(f"✗ Could not fetch PDF: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status code: {e.response.status_code}")
        return None


def get_kalshi_series_info(series_ticker):
    """
    Fetch series information including contract terms URL and settlement sources
    """
    api_key = os.getenv("KALSHI_API_KEY")
    base_url = os.getenv("KALSHI_BASE_URL", "https://api.elections.kalshi.com/trade-api/v2")

    print(f"\nFetching Kalshi series information...")
    print(f"Series Ticker: {series_ticker}")
    print("-" * 70)

    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    try:
        # Get series information
        series_endpoint = f"{base_url}/series/{series_ticker}"
        print(f"Endpoint: {series_endpoint}\n")

        response = requests.get(series_endpoint, headers=headers)
        response.raise_for_status()

        series_data = response.json()

        print("=" * 70)
        print("SERIES INFORMATION")
        print("=" * 70)
        print(json.dumps(series_data, indent=2))

        # Display key series info
        if "series" in series_data:
            series = series_data["series"]
            print("\n" + "-" * 70)
            print("SERIES SUMMARY")
            print("-" * 70)
            print(f"Title: {series.get('title', 'N/A')}")
            print(f"Ticker: {series.get('ticker', 'N/A')}")
            print(f"Category: {series.get('category', 'N/A')}")
            print(f"Frequency: {series.get('frequency', 'N/A')}")

            # Settlement sources
            if 'settlement_sources' in series:
                print(f"\nSettlement Sources:")
                for source in series['settlement_sources']:
                    print(f"  - {source.get('name', 'N/A')}")
                    if 'url' in source:
                        print(f"    URL: {source['url']}")

            # Contract URLs
            contract_terms_url = None
            if 'contract_url' in series:
                print(f"\nContract URL: {series['contract_url']}")
            if 'contract_terms_url' in series:
                contract_terms_url = series['contract_terms_url']
                print(f"Contract Terms PDF: {contract_terms_url}")

            return {
                "series": series_data,
                "contract_terms_url": contract_terms_url
            }

        return series_data

    except requests.exceptions.RequestException as e:
        print(f"\nError fetching series data: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status code: {e.response.status_code}")
            print(f"Response text: {e.response.text}")
        return None


def get_event_markets(event_ticker):
    """
    Fetch all market tickers for a given event
    """
    api_key = os.getenv("KALSHI_API_KEY")
    base_url = os.getenv("KALSHI_BASE_URL", "https://api.elections.kalshi.com/trade-api/v2")

    print(f"\nFetching markets for event: {event_ticker}")
    print("-" * 70)

    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    try:
        # Get event - markets are included by default
        event_endpoint = f"{base_url}/events/{event_ticker}"
        print(f"Endpoint: {event_endpoint}\n")

        response = requests.get(event_endpoint, headers=headers)
        response.raise_for_status()

        event_data = response.json()

        markets = []
        if "markets" in event_data:
            markets = event_data["markets"]

            print(f"Found {len(markets)} market(s) in this event:\n")
            for i, market in enumerate(markets, 1):
                ticker = market.get('ticker', 'N/A')
                title = market.get('title', 'N/A')
                status = market.get('status', 'N/A')
                print(f"{i}. {ticker}")
                print(f"   Title: {title}")
                print(f"   Status: {status}")
                print()

        return {
            "event_ticker": event_ticker,
            "markets": markets,
            "market_tickers": [m.get('ticker') for m in markets if 'ticker' in m]
        }

    except requests.exceptions.RequestException as e:
        print(f"\nError fetching event markets: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status code: {e.response.status_code}")
            print(f"Response text: {e.response.text}")
        return None


def get_kalshi_event_info(event_ticker, fetch_contract=True):
    """
    Fetch event information including settlement sources and contract rules
    """
    api_key = os.getenv("KALSHI_API_KEY")
    base_url = os.getenv("KALSHI_BASE_URL", "https://api.elections.kalshi.com/trade-api/v2")

    print(f"\nFetching Kalshi event information...")
    print(f"Event Ticker: {event_ticker}")
    print("-" * 70)

    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    try:
        # Get event information
        event_endpoint = f"{base_url}/events/{event_ticker}"
        print(f"Endpoint: {event_endpoint}\n")

        response = requests.get(event_endpoint, headers=headers)
        response.raise_for_status()

        event_data = response.json()

        print("=" * 70)
        print("EVENT INFORMATION")
        print("=" * 70)
        print(json.dumps(event_data, indent=2))

        # Display key event info
        series_ticker = None
        if "event" in event_data:
            event = event_data["event"]
            print("\n" + "-" * 70)
            print("EVENT SUMMARY")
            print("-" * 70)
            print(f"Title: {event.get('title', 'N/A')}")
            print(f"Ticker: {event.get('event_ticker', 'N/A')}")
            series_ticker = event.get('series_ticker', 'N/A')
            print(f"Series Ticker: {series_ticker}")
            print(f"Category: {event.get('category', 'N/A')}")
            print(f"Status: {event.get('status', 'N/A')}")

        # Fetch series information to get contract terms URL
        contract_data = None
        contract_terms_url = None
        if series_ticker and series_ticker != 'N/A':
            print("\n")
            series_info = get_kalshi_series_info(series_ticker)
            if series_info and 'contract_terms_url' in series_info:
                contract_terms_url = series_info['contract_terms_url']

                # Fetch the contract PDF if requested
                if fetch_contract and contract_terms_url:
                    print("\n")
                    print(f"Fetching contract from: {contract_terms_url}")
                    contract_data = fetch_pdf_from_url(contract_terms_url)

        return {
            "event": event_data,
            "contract": contract_data,
            "contract_url": contract_terms_url
        }

    except requests.exceptions.RequestException as e:
        print(f"\nError fetching event data: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status code: {e.response.status_code}")
            print(f"Response text: {e.response.text}")
        return None


def fetch_pdf_from_url(pdf_url):
    """
    Fetch and extract text from a PDF given its URL
    """
    print(f"\nAttempting to fetch PDF...")
    print(f"URL: {pdf_url}")
    print("-" * 70)

    try:
        response = requests.get(pdf_url)
        response.raise_for_status()

        print(f"✓ PDF found! Size: {len(response.content)} bytes")

        # Try to extract text from PDF if pypdf is available
        try:
            from pypdf import PdfReader
            from io import BytesIO

            pdf_file = BytesIO(response.content)
            reader = PdfReader(pdf_file)

            print(f"\n{'=' * 70}")
            print(f"CONTRACT TERMS (Extracted from PDF)")
            print(f"{'=' * 70}")
            print(f"Pages: {len(reader.pages)}\n")

            # Extract text from all pages
            full_text = ""
            for page in reader.pages:
                text = page.extract_text()
                full_text += text + "\n"

            print(full_text)

            return {
                "pdf_url": pdf_url,
                "text": full_text,
                "num_pages": len(reader.pages)
            }

        except ImportError:
            print("\nNote: Install 'pypdf' to extract text from PDF")
            print("Run: pip install pypdf")
            print(f"\nYou can download the PDF manually from: {pdf_url}")

            return {
                "pdf_url": pdf_url,
                "text": None,
                "note": "pypdf not installed"
            }

    except requests.exceptions.RequestException as e:
        print(f"✗ Could not fetch PDF: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status code: {e.response.status_code}")
        return None


def get_kalshi_orderbook(market_ticker):
    """
    Fetch orderbook data from Kalshi API for a specific market
    """
    # Get API credentials from environment
    api_key = os.getenv("KALSHI_API_KEY")
    base_url = os.getenv("KALSHI_BASE_URL", "https://api.elections.kalshi.com/trade-api/v2")

    print(f"\nFetching Kalshi orderbook data...")
    print(f"Market Ticker: {market_ticker}")
    print(f"Base URL: {base_url}")
    print("-" * 70)

    # Set up headers
    headers = {
        "Content-Type": "application/json"
    }

    # Add authentication if available
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
        print("Using API authentication")
    else:
        print("Warning: KALSHI_API_KEY not found in .env file")
        print("Attempting to fetch public market data...")

    try:
        # First, get market information
        market_endpoint = f"{base_url}/markets/{market_ticker}"
        print(f"\nFetching market info from: {market_endpoint}")

        response = requests.get(market_endpoint, headers=headers)
        response.raise_for_status()

        market_data = response.json()

        print("\n" + "=" * 70)
        print("MARKET INFORMATION")
        print("=" * 70)
        print(json.dumps(market_data, indent=2))

        # Extract and display key market info
        if "market" in market_data:
            market = market_data["market"]
            print("\n" + "-" * 70)
            print("MARKET SUMMARY")
            print("-" * 70)
            print(f"Title: {market.get('title', 'N/A')}")
            print(f"Ticker: {market.get('ticker_name', 'N/A')}")
            print(f"Status: {market.get('status', 'N/A')}")
            print(f"Close Time: {market.get('close_time', 'N/A')}")
            print(f"Yes Bid: {market.get('yes_bid', 'N/A')}¢")
            print(f"Yes Ask: {market.get('yes_ask', 'N/A')}¢")
            print(f"No Bid: {market.get('no_bid', 'N/A')}¢")
            print(f"No Ask: {market.get('no_ask', 'N/A')}¢")
            print(f"Last Price: {market.get('last_price', 'N/A')}¢")
            print(f"Volume: {market.get('volume', 'N/A')}")

        # Now get the orderbook
        orderbook_endpoint = f"{base_url}/markets/{market_ticker}/orderbook"
        print(f"\n{'=' * 70}")
        print("ORDERBOOK DATA")
        print("=" * 70)
        print(f"Fetching from: {orderbook_endpoint}")

        orderbook_response = requests.get(orderbook_endpoint, headers=headers)
        orderbook_response.raise_for_status()

        orderbook_data = orderbook_response.json()

        print("\nRaw Orderbook Response:")
        print(json.dumps(orderbook_data, indent=2))

        # Parse and display orderbook information
        if "orderbook" in orderbook_data:
            orderbook = orderbook_data["orderbook"]

            print("\n" + "-" * 70)
            print("ORDERBOOK SUMMARY")
            print("-" * 70)

            # Display YES orders
            if "yes" in orderbook:
                yes_orders = orderbook["yes"]
                print(f"\nYES Side Orders: {len(yes_orders) if isinstance(yes_orders, list) else 0}")
                if isinstance(yes_orders, list) and len(yes_orders) > 0:
                    print(f"{'Level':<6} {'Price (¢)':<12} {'Quantity':<12}")
                    print("-" * 35)
                    for i, order in enumerate(yes_orders[:10], 1):
                        # Handle both list and dict formats
                        if isinstance(order, dict):
                            price = order.get('price', 'N/A')
                            quantity = order.get('quantity', 'N/A')
                        elif isinstance(order, (list, tuple)) and len(order) >= 2:
                            price = order[0]
                            quantity = order[1]
                        else:
                            price = 'N/A'
                            quantity = 'N/A'
                        print(f"{i:<6} {price:<12} {quantity:<12}")

            # Display NO orders
            if "no" in orderbook:
                no_orders = orderbook["no"]
                print(f"\nNO Side Orders: {len(no_orders) if isinstance(no_orders, list) else 0}")
                if isinstance(no_orders, list) and len(no_orders) > 0:
                    print(f"{'Level':<6} {'Price (¢)':<12} {'Quantity':<12}")
                    print("-" * 35)
                    for i, order in enumerate(no_orders[:10], 1):
                        # Handle both list and dict formats
                        if isinstance(order, dict):
                            price = order.get('price', 'N/A')
                            quantity = order.get('quantity', 'N/A')
                        elif isinstance(order, (list, tuple)) and len(order) >= 2:
                            price = order[0]
                            quantity = order[1]
                        else:
                            price = 'N/A'
                            quantity = 'N/A'
                        print(f"{i:<6} {price:<12} {quantity:<12}")

        return {
            "market": market_data,
            "orderbook": orderbook_data
        }

    except requests.exceptions.RequestException as e:
        print(f"\nError fetching data from Kalshi: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status code: {e.response.status_code}")
            print(f"Response text: {e.response.text}")
        return None


if __name__ == "__main__":
    import sys

    # Check if event ticker is provided as command line argument
    if len(sys.argv) > 1:
        event_ticker = sys.argv[1]

        print("=" * 70)
        print(f"COMPREHENSIVE KALSHI EVENT ANALYSIS")
        print("=" * 70)
        print(f"Event Ticker: {event_ticker}\n")

        # Step 1: Get event information and contract rules
        print("\n" + "=" * 70)
        print("STEP 1: FETCHING EVENT INFO & CONTRACT RULES")
        print("=" * 70)
        event_info = get_kalshi_event_info(event_ticker, fetch_contract=True)

        # Step 2: Get all markets for this event
        print("\n\n" + "=" * 70)
        print("STEP 2: FETCHING ALL MARKETS IN EVENT")
        print("=" * 70)
        markets_info = get_event_markets(event_ticker)

        # Step 3: Get orderbook for each market
        if markets_info and markets_info.get("market_tickers"):
            print("\n\n" + "=" * 70)
            print("STEP 3: FETCHING ORDERBOOKS FOR ALL MARKETS")
            print("=" * 70)

            for i, market_ticker in enumerate(markets_info["market_tickers"], 1):
                print(f"\n\n{'#' * 70}")
                print(f"MARKET {i}/{len(markets_info['market_tickers'])}: {market_ticker}")
                print(f"{'#' * 70}")
                get_kalshi_orderbook(market_ticker)

        print("\n\n" + "=" * 70)
        print("ANALYSIS COMPLETE")
        print("=" * 70)

    else:
        # Default: Run example events with comprehensive analysis
        print("Usage: python kalshi_api.py <event_ticker>")
        print("\nExample event tickers:")
        print(f"  - {KALSHI_RATE_CUTS_2025_TICKER} (Number of Rate Cuts in 2025)")
        print(f"  - {KALSHI_SWIFT_KELCE_TICKER} (Swift/Kelce Marriage)")
        print("\nRunning comprehensive analysis on example events...\n")

        # Test 1: Rate Cuts 2025 Event
        print("\n" + "=" * 70)
        print("COMPREHENSIVE ANALYSIS: Number of Rate Cuts in 2025")
        print("=" * 70)

        event_info = get_kalshi_event_info(KALSHI_RATE_CUTS_2025_TICKER, fetch_contract=True)
        markets_info = get_event_markets(KALSHI_RATE_CUTS_2025_TICKER)

        if markets_info and markets_info.get("market_tickers"):
            for market_ticker in markets_info["market_tickers"]:
                print(f"\n{'#' * 70}")
                print(f"ORDERBOOK: {market_ticker}")
                print(f"{'#' * 70}")
                get_kalshi_orderbook(market_ticker)

        # Test 2: Swift/Kelce Marriage Event
        print("\n\n\n" + "=" * 70)
        print("COMPREHENSIVE ANALYSIS: Taylor Swift & Travis Kelce Marriage 2025")
        print("=" * 70)

        event_info = get_kalshi_event_info(KALSHI_SWIFT_KELCE_TICKER, fetch_contract=True)
        markets_info = get_event_markets(KALSHI_SWIFT_KELCE_TICKER)

        if markets_info and markets_info.get("market_tickers"):
            for market_ticker in markets_info["market_tickers"]:
                print(f"\n{'#' * 70}")
                print(f"ORDERBOOK: {market_ticker}")
                print(f"{'#' * 70}")
                get_kalshi_orderbook(market_ticker)

