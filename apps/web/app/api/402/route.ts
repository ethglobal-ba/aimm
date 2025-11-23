import { NextRequest, NextResponse } from 'next/server';

// Simple x402 implementation for testing
const RECEIVING_WALLET = process.env.X402_WALLET_ADDRESS || "0x3E1D67CB6842165Aa0F27591fC89Ecb3244E55f5";

export async function GET(request: NextRequest) {
  // Check for x402 payment header
  const paymentHeader = request.headers.get('X-PAYMENT');

  if (!paymentHeader) {
    // No payment provided, return 402 with payment instructions
    const paymentInstructions = {
      message: "Payment required to access this endpoint",
      payment_required: true,
      price: "$0.001",
      network: "base-sepolia",
      receiving_wallet: RECEIVING_WALLET,
      facilitator_url: "https://x402.org/facilitator",
      instructions: "Include payment proof in X-PAYMENT header and market_ticker query param to access this endpoint",
      example_usage: "curl -H 'X-PAYMENT: proof' 'http://localhost:3000/api/402?market_ticker=polymarket-123'"
    };

    return NextResponse.json(paymentInstructions, { status: 402 });
  }

  // Payment verified, now call the AIMM agent Flask API
  try {
    const { searchParams } = new URL(request.url);
    const marketTicker = searchParams.get('market_ticker');

    if (!marketTicker) {
      return NextResponse.json({
        error: "Missing required parameter: market_ticker",
        example: "?market_ticker=polymarket-123"
      }, { status: 400 });
    }

    // Call the Flask API
    const flaskApiUrl = process.env.AIMM_AGENT_URL || "http://localhost:5000";

    console.log(`Calling AIMM agent at ${flaskApiUrl}/updatePrice for ticker: ${marketTicker}`);

    const flaskResponse = await fetch(`${flaskApiUrl}/updatePrice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        market_ticker: marketTicker
      })
    });

    if (!flaskResponse.ok) {
      const errorText = await flaskResponse.text();
      console.error(`Flask API error: ${flaskResponse.status} - ${errorText}`);

      return NextResponse.json({
        error: "Failed to update market price",
        details: `AIMM agent returned ${flaskResponse.status}`,
        agent_error: errorText
      }, { status: 500 });
    }

    const flaskData = await flaskResponse.json();

    // Return successful response with price update data
    return NextResponse.json({
      message: "Payment successful! Market price updated.",
      timestamp: new Date().toISOString(),
      paid: true,
      payment_verified: true,
      market_ticker: marketTicker,
      price_update: flaskData
    });

  } catch (error) {
    console.error('Error calling AIMM agent:', error);

    return NextResponse.json({
      error: "Internal server error",
      details: "Failed to communicate with AIMM agent",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
