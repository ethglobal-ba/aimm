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

        # Extract key results
        response = {
            "status": "success",
            "event_ticker": result["event_ticker"],
            "market_ticker": market_ticker,
            "research_fair_price": result["research_fair_price"],
            "orderbook_mid_price": result["orderbook_mid_price"],
            "final_fair_price": result["final_fair_price"],
            "final_spread": result["final_spread"],
            "price_delta": result["price_delta"],
            "final_orders": result["final_orders"]
        }

        return jsonify(response), 200

    except Exception as e:
        import traceback
        print(f"Error in update_price: {e}")
        print(traceback.format_exc())
        return jsonify({"status": "error", "message": str(e)}), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
