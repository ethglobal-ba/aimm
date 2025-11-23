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
      instructions: "Include payment proof in X-PAYMENT header to access this endpoint"
    };

    return NextResponse.json(paymentInstructions, { status: 402 });
  }

  // Payment header exists (in real implementation, you'd verify it)
  // For testing purposes, we'll accept any non-empty payment header
  return NextResponse.json({
    message: "Payment successful! Here's your protected data.",
    timestamp: new Date().toISOString(),
    paid: true,
    data: "This is the premium content you paid for!",
    payment_verified: true
  });
}
