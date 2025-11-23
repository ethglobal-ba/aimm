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

  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  // eslint-disable-next-line no-console
  console.log('[ai-agent-output/actions] Incoming request', {
    requestId,
    url: request.url,
    limit,
    marketId,
    marketTicker,
  });

  try {
    const actions = await getRecentAgentActions(limit, {
      marketId: marketId ?? undefined,
      marketTicker: marketTicker ?? undefined,
    });

    // eslint-disable-next-line no-console
    console.log('[ai-agent-output/actions] Query result', {
      requestId,
      actionsCount: actions.length,
    });

    const dto = actions.map(action => ({
      ...action,
      timestamp: action.timestamp.toISOString(),
    }));

    // eslint-disable-next-line no-console
    console.log('[ai-agent-output/actions] Response payload ready', {
      requestId,
      dtoCount: dto.length,
    });

    return Response.json({ actions: dto });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[ai-agent-output/actions] Failed to fetch recent agent actions', {
      requestId,
      error,
    });

    return new Response('Internal Server Error', { status: 500 });
  }
}
