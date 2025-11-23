import { NextRequest } from 'next/server';

import { getLatestRunsByMarketTicker } from '@/lib/ai-agent-output';

export async function GET(request: NextRequest): Promise<Response> {
  const url = new URL(request.url);
  const limitParam = url.searchParams.get('limitPerMarket');

  let limitPerMarket = 10;

  if (limitParam !== null) {
    const parsed = Number.parseInt(limitParam, 10);

    if (Number.isNaN(parsed) || parsed <= 0) {
      return new Response('limitPerMarket must be a positive integer', { status: 400 });
    }

    limitPerMarket = parsed;
  }

  try {
    const steps = await getLatestRunsByMarketTicker(limitPerMarket);

    return Response.json({ steps });
  } catch (error: unknown) {
    // Log server-side so issues are visible during development and in logs.
    // We avoid using `any` here by treating the error as `unknown`.
    // eslint-disable-next-line no-console
    console.error('Failed to fetch latest ai_agent_output runs', error);

    return new Response('Internal Server Error', { status: 500 });
  }
}


