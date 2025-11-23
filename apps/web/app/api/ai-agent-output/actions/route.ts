import { NextRequest } from 'next/server';

import { getRecentAgentActions } from '@/lib/agent-actions';

export async function GET(request: NextRequest): Promise<Response> {
  const url = new URL(request.url);
  const limitParam = url.searchParams.get('limit');
  const marketId = url.searchParams.get('marketId');
  const marketTicker = url.searchParams.get('marketTicker');

  let limit = 20;

  if (limitParam !== null) {
    const parsed = Number.parseInt(limitParam, 10);

    if (Number.isNaN(parsed) || parsed <= 0) {
      return new Response('limit must be a positive integer', { status: 400 });
    }

    limit = parsed;
  }

  try {
    const actions = await getRecentAgentActions(limit, {
      marketId: marketId ?? undefined,
      marketTicker: marketTicker ?? undefined,
    });

    const dto = actions.map(action => ({
      ...action,
      timestamp: action.timestamp.toISOString(),
    }));

    return Response.json({ actions: dto });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch recent agent actions', error);

    return new Response('Internal Server Error', { status: 500 });
  }
}
