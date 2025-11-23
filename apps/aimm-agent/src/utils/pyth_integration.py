"""
Integration utilities for Pyth Network price feeds in the market maker agent.

This module provides two ways to get Pyth price data:
1. Direct API fetch (get_pyth_prices) - Fast, no gas costs
2. Oracle contract update (update_pyth_oracle_prices) - On-chain verification, requires gas
"""

import re
import requests
from typing import Optional, Dict, Any
import sys
import os
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

# Add project root to path for pyth_price_client import
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from pyth_price_client import PythClient

load_dotenv()

# Pyth Network price feed IDs for common crypto assets
PYTH_PRICE_FEED_IDS = {
    'BTC/USD': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
    'ETH/USD': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    'SOL/USD': '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
    'AVAX/USD': '0x93da3352f9f1d96f46db01f0dc64415ab8c7e86c5a8a5c5bfe19e63362d68f1f',
    'DOGE/USD': '0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c',
    'ADA/USD': '0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d',
    'MATIC/USD': '0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52',
    'DOT/USD': '0xca3eed9b267293f6595901c734c7525ce8ef49adafe8284606ceb307afa2ca5b',
    'LINK/USD': '0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221',
    'UNI/USD': '0x78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501',
}

# PythOracle contract configuration
PYTH_ORACLE_ADDRESS = os.getenv("PYTH_ORACLE_ADDRESS", "0x3E1D67CB6842165Aa0F27591fC89Ecb3244E55f5")
BASE_SEPOLIA_RPC_URL = os.getenv("BASE_SEPOLIA_RPC_URL", "https://base-sepolia-rpc.publicnode.com")
HERMES_BASE_URL = "https://hermes.pyth.network"

# PythOracle contract ABI
PYTH_ORACLE_ABI = [
    {
        "type": "function",
        "name": "updatePrice",
        "inputs": [
            {"name": "priceUpdate", "type": "bytes[]"},
            {"name": "priceFeedId", "type": "bytes32"}
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "event",
        "name": "PriceUpdated",
        "inputs": [
            {"indexed": True, "name": "priceFeedId", "type": "bytes32"},
            {"indexed": False, "name": "price", "type": "int64"},
            {"indexed": False, "name": "publishTime", "type": "uint256"}
        ]
    }
]


def extract_price_symbols_from_market(market_name: str, event_info: Dict) -> list[str]:
    """
    Extract potential price symbols from market name or event description.

    Args:
        market_name: Market name (e.g., "Will BTC close above $50k?")
        event_info: Event information dictionary

    Returns:
        List of potential symbols to query (e.g., ["BTC/USD", "ETH/USD"])
    """
    symbols = []

    # Common crypto symbols to look for (both tickers and full names)
    crypto_patterns = {
        r'\b(BTC|BITCOIN)\b': 'BTC/USD',
        r'\b(ETH|ETHEREUM)\b': 'ETH/USD',
        r'\b(SOL|SOLANA)\b': 'SOL/USD',
        r'\bAVAX\b': 'AVAX/USD',
        r'\b(DOGE|DOGECOIN)\b': 'DOGE/USD',
        r'\b(ADA|CARDANO)\b': 'ADA/USD',
        r'\b(MATIC|POLYGON)\b': 'MATIC/USD',
        r'\b(DOT|POLKADOT)\b': 'DOT/USD',
        r'\b(LINK|CHAINLINK)\b': 'LINK/USD',
        r'\b(UNI|UNISWAP)\b': 'UNI/USD',
    }

    # Search in market name and event title
    search_text = market_name.upper()
    if event_info and 'event' in event_info:
        title = event_info['event'].get('title', '')
        search_text += ' ' + title.upper()

    # Look for crypto symbols
    for pattern, symbol in crypto_patterns.items():
        if re.search(pattern, search_text):
            symbols.append(symbol)

    return symbols


def get_pyth_prices(symbols: list[str]) -> Dict[str, Any]:
    """
    Get Pyth Network price data for the given symbols.

    Args:
        symbols: List of symbols to fetch (e.g., ["BTC/USD", "ETH/USD"])

    Returns:
        Dictionary mapping symbols to price data
    """
    if not symbols:
        return {}

    client = PythClient()
    prices = {}

    for symbol in symbols:
        try:
            result = client.get_price_by_symbol(symbol, asset_type="crypto")
            if result and result.get('price_data'):
                price_data = result['price_data']
                formatted_price = client.format_price(price_data.get('price', {}))

                if formatted_price is not None:
                    # Calculate confidence interval
                    conf_price = client.format_price({
                        'price': price_data.get('price', {}).get('conf', '0'),
                        'expo': price_data.get('price', {}).get('expo', 0)
                    })

                    prices[symbol] = {
                        'price': formatted_price,
                        'confidence': conf_price if conf_price else 0,
                        'publish_time': price_data.get('price', {}).get('publish_time'),
                        'feed_id': result['feed_info'].get('id'),
                        'symbol_full': result['feed_info'].get('attributes', {}).get('symbol', symbol)
                    }
        except Exception as e:
            print(f"Warning: Failed to fetch Pyth price for {symbol}: {e}")
            continue

    return prices


def format_pyth_context(prices: Dict[str, Any]) -> str:
    """
    Format Pyth price data into a readable context string for the LLM.

    Args:
        prices: Dictionary of price data from get_pyth_prices

    Returns:
        Formatted string for LLM context
    """
    if not prices:
        return ""

    from datetime import datetime, timezone

    lines = ["REAL-TIME PRICE DATA (Pyth Network):"]
    for symbol, data in prices.items():
        price = data['price']
        conf = data['confidence']
        timestamp = data.get('publish_time')

        time_str = ""
        if timestamp:
            dt = datetime.fromtimestamp(timestamp, tz=timezone.utc)
            time_str = f" (as of {dt.strftime('%H:%M:%S UTC')})"

        lines.append(f"  {symbol}: ${price:,.2f} ±${conf:,.2f}{time_str}")

    return "\n".join(lines)


def get_price_update_data(price_feed_id: str) -> tuple[list, dict]:
    """
    Fetch price update data from Hermes API for oracle contract updates.

    Args:
        price_feed_id: Pyth price feed ID (e.g., '0xff61...0ace')

    Returns:
        Tuple of (price_updates as bytes list, parsed_data dict)
    """
    try:
        url = f"{HERMES_BASE_URL}/v2/updates/price/latest"
        params = {
            'ids[]': price_feed_id,
            'encoding': 'hex',
            'parsed': 'true'
        }

        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        if 'binary' not in data or 'parsed' not in data:
            raise Exception("Invalid response format from Hermes API")

        # Extract the binary data (price update bytes) and convert to bytes
        price_updates = [bytes.fromhex(update) for update in data['binary']['data']]
        parsed_data = data['parsed'][0] if data['parsed'] else {}

        return price_updates, parsed_data

    except Exception as e:
        print(f"Warning: Failed to fetch price update data for {price_feed_id}: {e}")
        return [], {}


def update_pyth_oracle_price(symbol: str, dry_run: bool = False) -> Optional[Dict[str, Any]]:
    """
    Update price on the PythOracle contract for a given symbol.

    Args:
        symbol: Symbol like "BTC/USD", "ETH/USD"
        dry_run: If True, only fetch data without sending transaction

    Returns:
        Dictionary with transaction info and price data, or None if failed
    """
    # Get price feed ID for this symbol
    price_feed_id = PYTH_PRICE_FEED_IDS.get(symbol)
    if not price_feed_id:
        print(f"Warning: No price feed ID found for {symbol}")
        return None

    # Get price update data
    price_updates, parsed_data = get_price_update_data(price_feed_id)
    if not price_updates:
        return None

    # Extract price info
    price_info = parsed_data.get('price', {}) if parsed_data else {}
    price_value = None
    if price_info and 'price' in price_info:
        try:
            price_value = int(price_info['price']) * (10 ** int(price_info['expo']))
        except:
            pass

    if dry_run:
        print(f"🔍 Dry run: Would update {symbol} to ${price_value:.6f}" if price_value else f"🔍 Dry run: Would update {symbol}")
        return {
            'symbol': symbol,
            'feed_id': price_feed_id,
            'price': price_value,
            'dry_run': True
        }

    # Get private key for transaction signing
    private_key = os.getenv('PRIVATE_KEY')
    if not private_key:
        print("Warning: PRIVATE_KEY not set in environment, skipping oracle update")
        return {
            'symbol': symbol,
            'feed_id': price_feed_id,
            'price': price_value,
            'skipped': True,
            'reason': 'No private key'
        }

    try:
        # Connect to Base Sepolia
        w3 = Web3(Web3.HTTPProvider(BASE_SEPOLIA_RPC_URL))
        if not w3.is_connected():
            raise Exception(f"Failed to connect to {BASE_SEPOLIA_RPC_URL}")

        # Setup contract and account
        oracle_address = Web3.to_checksum_address(PYTH_ORACLE_ADDRESS)
        oracle_contract = w3.eth.contract(address=oracle_address, abi=PYTH_ORACLE_ABI)
        account = Account.from_key(private_key)

        # Convert price_feed_id to bytes32
        feed_id_bytes32 = Web3.to_bytes(hexstr=price_feed_id)

        # Prepare transaction
        nonce = w3.eth.get_transaction_count(account.address)

        # Build transaction
        transaction = oracle_contract.functions.updatePrice(
            price_updates,
            feed_id_bytes32
        ).build_transaction({
            'from': account.address,
            'nonce': nonce,
            'gas': 500000,
            'gasPrice': w3.eth.gas_price,
            'value': 0
        })

        # Sign and send transaction
        signed_txn = account.sign_transaction(transaction)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)

        print(f"📤 Updating {symbol} on PythOracle: {tx_hash.hex()}")

        # Wait for confirmation
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

        if receipt.status == 1:
            print(f"✅ Oracle updated for {symbol}")
            return {
                'symbol': symbol,
                'feed_id': price_feed_id,
                'price': price_value,
                'tx_hash': tx_hash.hex(),
                'block_number': receipt.blockNumber,
                'success': True
            }
        else:
            print(f"❌ Oracle update failed for {symbol}")
            return None

    except Exception as e:
        print(f"Warning: Failed to update oracle for {symbol}: {e}")
        return None


def update_pyth_oracle_prices(symbols: list[str], dry_run: bool = False) -> Dict[str, Any]:
    """
    Update prices on the PythOracle contract for multiple symbols.

    Args:
        symbols: List of symbols like ["BTC/USD", "ETH/USD"]
        dry_run: If True, only fetch data without sending transactions

    Returns:
        Dictionary mapping symbols to their update results
    """
    results = {}
    for symbol in symbols:
        result = update_pyth_oracle_price(symbol, dry_run=dry_run)
        if result:
            results[symbol] = result
    return results
