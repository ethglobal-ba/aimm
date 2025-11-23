'use client';

import { useEffect, useState } from 'react';
import { FlashIcon } from 'hugeicons-react';
import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/lib/utils';
import {
  mockAgentActions,
  formatAgentActionTime,
  getAgentActionStatusLabel,
  type AgentAction,
  type AgentActionStatus,
} from '@/lib/mock-agent-actions';

/**
 * Get the dot color class based on how recent the action timestamp is.
 */
function getTimestampDotClass(timestamp: Date, now: Date): string {
  const diffMs = now.getTime() - timestamp.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 5) {
    return 'bg-green-400'; // Now / very recent
  } else if (diffSeconds < 20) {
    return 'bg-orange-400'; // Recent
  } else {
    return 'bg-gray-500'; // Older
  }
}

/**
 * Get the status badge styling based on the agent action status.
 */
function getStatusBadgeClass(status: AgentActionStatus): string {
  switch (status) {
    case 'DETECTED_EDGE':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'PLACING_BID':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'SCANNING':
      return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    case 'POSITION_CLOSE':
      return 'bg-green-500/10 text-green-400 border-green-500/30';
  }
}

/**
 * MOCK: Live Agent Actions panel component.
 *
 * This component displays a real-time feed of agent actions happening across
 * the AIMM system. Currently uses mock data from `mock-agent-actions.ts` with
 * simulated timestamp updates. In production, this will be replaced by a live
 * WebSocket connection or polling mechanism.
 */
export function LiveAgentActions() {
  // Force re-render every second to update relative timestamps
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // MOCK: Using static mock data. In production, this would come from a live data source.
  const actions: AgentAction[] = mockAgentActions;

  return (
    <div className='flex h-full flex-col'>
      {/* Header */}
      <div className='border-border flex items-center justify-between border-b px-3 py-2.5'>
        <div className='flex items-center gap-1.5'>
          <FlashIcon className='text-yellow-400 h-4 w-4' />
          <h2 className='text-foreground text-sm font-semibold'>Live Agent Actions</h2>
        </div>
        <Badge className='bg-green-500/10 text-green-400 border-green-500/30 h-5 gap-1 border px-1.5 text-[10px] font-medium'>
          <span className='h-1 w-1 rounded-full bg-green-400' />
          Active
        </Badge>
      </div>

      {/* Actions List */}
      <div className='flex-1 space-y-0 overflow-y-auto'>
        {actions.map(action => {
          const timeLabel = formatAgentActionTime(action.timestamp, now);
          const dotClass = getTimestampDotClass(action.timestamp, now);
          const statusLabel = getAgentActionStatusLabel(action.status);
          const badgeClass = getStatusBadgeClass(action.status);

          return (
            <div key={action.id} className='border-border flex flex-col gap-1.5 border-b px-3 py-2.5 last:border-b-0'>
              {/* Timestamp with colored dot */}
              <div className='flex items-center gap-1.5'>
                <span className={cn('h-1 w-1 rounded-full', dotClass)} />
                <span className='text-muted-foreground text-[10px]' suppressHydrationWarning>
                  {timeLabel}
                </span>
              </div>

              {/* Agent name and status */}
              <div className='flex items-center gap-1.5'>
                <span className='text-foreground truncate text-xs font-medium'>{action.agentName}</span>
                <Badge
                  variant='outline'
                  className={cn('h-auto shrink-0 rounded-sm px-1.5 py-0 text-[9px] font-semibold uppercase leading-tight', badgeClass)}
                >
                  {statusLabel}
                </Badge>
              </div>

              {/* Description */}
              <p className='text-muted-foreground truncate text-[11px]'>{action.description}</p>

              {/* Progress indicator */}
              <div className='flex items-center gap-2'>
                <div className='bg-muted h-1 flex-1 overflow-hidden rounded-full'>
                  <div className='bg-foreground h-full transition-all' style={{ width: `${action.progress}%` }} />
                </div>
                <span className='text-foreground font-mono text-[10px] font-medium'>{action.progress}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

