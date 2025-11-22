from flask import Flask, request, jsonify

app = Flask(__name__)


@app.route("/", methods=["GET"])
def home():
    print("Hit health check at /")
    return "Ko"


@app.route("/updatePrice", methods=["POST"])
def update_price(price):
    try:
        print("Updating price at /updatePrice")
        # Here you can add logic to handle the price update
        return jsonify({"status": "success", "price": price}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
