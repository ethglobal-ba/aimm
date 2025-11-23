from flask import Flask, request, jsonify

app = Flask(__name__)


@app.route("/", methods=["GET"])
def home():
    print("Hit health check at /")
    return "Ko"


@app.route("/updatePrice", methods=["POST"])
def update_price():
    try:
        print("Updating price at /updatePrice")

        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "No JSON data provided"}), 400

        market_ticker = data.get("market_ticker")

        if not market_ticker:
            return jsonify({
                "status": "error",
                "message": "market_ticker is required"
            }), 400

        # Import the market maker analysis function
        from src.agents.market_maker_stateful import analyze_market_stateful

        # Run the fair price analysis
        print(f"Running fair price analysis for {market_ticker}")
        result = analyze_market_stateful(market_ticker)

        if not result:
            return jsonify({
                "status": "error",
                "message": "Failed to analyze market"
            }), 500

        # Extract key results including contract update
        response = {
            "status": "success",
            "event_ticker": result["event_ticker"],
            "market_ticker": market_ticker,
            "baseline_fair_price": result["baseline_fair_price"],
            "orderbook_mid_price": result["orderbook_mid_price"],
            "final_fair_price": result["final_fair_price"],
            "final_spread": result["final_spread"],
            "price_delta": result["price_delta"],
            "final_orders": result["final_orders"],
            "contract_update": result.get("contract_update", {})
        }

        return jsonify(response), 200

    except Exception as e:
        import traceback
        print(f"Error in update_price: {e}")
        print(traceback.format_exc())
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/updateAllPrices", methods=["POST"])
def update_all_prices():
    """
    Update prices for all active markets from GraphQL.

    Optional request body:
        {
            "limit": 10  # Optional: limit number of markets to process
        }
    """
    try:
        print("Updating all prices at /updateAllPrices")

        # Get optional limit from request
        data = request.get_json() or {}
        limit = data.get("limit", None)

        # Import required functions
        from src.utils.fetch_markets import get_active_markets
        from src.agents.market_maker_stateful import analyze_market_stateful

        # Fetch all active markets from GraphQL
        print("\nFetching active markets from GraphQL...")
        active_markets = get_active_markets()

        if not active_markets:
            return jsonify({
                "status": "error",
                "message": "No active markets found"
            }), 404

        # Apply limit if specified
        markets_to_process = active_markets[:limit] if limit else active_markets
        print(f"\nProcessing {len(markets_to_process)} markets...")

        # Process each market
        results = []
        success_count = 0
        error_count = 0

        for i, market in enumerate(markets_to_process, 1):
            market_ticker = market.get("externalId")
            market_name = market.get("marketName", "Unknown")

            print(f"\n{'='*80}")
            print(f"Processing market {i}/{len(markets_to_process)}: {market_ticker}")
            print(f"Name: {market_name}")
            print(f"{'='*80}")

            try:
                # Run analysis
                result = analyze_market_stateful(market_ticker)

                if result:
                    results.append({
                        "market_ticker": market_ticker,
                        "market_name": market_name,
                        "status": "success",
                        "final_fair_price": result["final_fair_price"],
                        "final_spread": result["final_spread"],
                        "contract_update": result.get("contract_update", {})
                    })
                    success_count += 1
                    print(f"✅ Successfully processed {market_ticker}")
                else:
                    results.append({
                        "market_ticker": market_ticker,
                        "market_name": market_name,
                        "status": "error",
                        "message": "Analysis returned None"
                    })
                    error_count += 1
                    print(f"❌ Failed to process {market_ticker}")

            except Exception as e:
                import traceback
                print(f"❌ Error processing {market_ticker}: {e}")
                print(traceback.format_exc())
                results.append({
                    "market_ticker": market_ticker,
                    "market_name": market_name,
                    "status": "error",
                    "message": str(e)
                })
                error_count += 1

        # Return summary
        response = {
            "status": "success",
            "total_markets": len(markets_to_process),
            "success_count": success_count,
            "error_count": error_count,
            "results": results
        }

        return jsonify(response), 200

    except Exception as e:
        import traceback
        print(f"Error in update_all_prices: {e}")
        print(traceback.format_exc())
        return jsonify({"status": "error", "message": str(e)}), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
