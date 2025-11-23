import { NextRequest, NextResponse } from 'next/server';

// NOTE:
// x402 payment enforcement and verification are handled by the Next.js middleware
// defined in `apps/web/middleware.ts` using `paymentMiddleware` from `x402-next`.
// By the time this route handler runs, the request has either:
// - Been rejected with a 402 response by the middleware, or
// - Successfully verified and (optionally) settled by the facilitator.
//
// This handler is therefore responsible only for performing the paid work:
// triggering the AIMM agent to recompute fair prices for the requested market.

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marketTicker = searchParams.get('market_ticker');

    if (!marketTicker) {
      return NextResponse.json(
        {
          error: 'Missing required parameter: market_ticker',
          example: '?market_ticker=polymarket-123',
        },
        { status: 400 }
      );
    }

    // Call the Flask AIMM agent API to recompute fair prices.
    const flaskApiUrl = 'http://localhost:5000';

    console.log(`Calling AIMM agent at ${flaskApiUrl}/updatePrice for ticker: ${marketTicker}`);

    const flaskResponse = await fetch(`${flaskApiUrl}/updatePrice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        market_ticker: marketTicker,
      }),
    });

    if (!flaskResponse.ok) {
      const errorText = await flaskResponse.text();
      console.error(`Flask API error: ${flaskResponse.status} - ${errorText}`);

      return NextResponse.json(
        {
          error: 'Failed to update market price',
          details: `AIMM agent returned ${flaskResponse.status}`,
          agent_error: errorText,
        },
        { status: 500 }
      );
    }

    const flaskData = await flaskResponse.json();

    return NextResponse.json({
      message: 'Payment successful! Market price updated.',
      timestamp: new Date().toISOString(),
      paid: true,
      payment_verified: true,
      market_ticker: marketTicker,
      price_update: flaskData,
    });
  } catch (error) {
    console.error('Error calling AIMM agent:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: 'Failed to communicate with AIMM agent',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
