'use client';

import { useEffect, useState } from 'react';
import { FlashIcon } from 'hugeicons-react';
import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/lib/utils';
import { formatAgentActionTime } from '@/lib/mock-agent-actions';
import type { Direction, StepOutput } from '@/lib/ai-agent-output-types';

interface LiveAgentAction {
  id: string;
  timestamp: Date;
  runId: string;
  stepIndex: number;
  marketTicker?: string;
  stepKind: string;
  stepLoading?: boolean;
  headline?: string;
  summary?: string;
  direction?: Direction;
  stepOutput: StepOutput;
}

interface LiveAgentActionsProps {
  readonly marketId?: string;
  readonly marketTicker?: string;
  readonly hideHeader?: boolean;
}

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
 * Convert a raw step_kind into a more readable label while preserving meaning.
 * - Keeps the original tokens, just lowercases and capitalizes them.
 * - Replaces common separators like '_' and '-' with spaces.
 */
function getStatusLabel(stepKind: string): string {
  const normalized = stepKind.replace(/[_-]+/g, ' ').toLowerCase().trim();

  if (normalized.length === 0) {
    return stepKind;
  }

  return normalized
    .split(' ')
    .map(word => (word.length === 0 ? word : word[0]!.toUpperCase() + word.slice(1)))
    .join(' ');
}

function getDirectionBadgeClass(direction: Direction | undefined): string {
  if (direction === 'lean_yes') {
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40';
  }

  if (direction === 'lean_no') {
    return 'bg-rose-500/15 text-rose-400 border-rose-500/40';
  }

  if (direction === 'neutral') {
    return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
  }

  return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
}

function getDirectionLabel(direction: Direction | undefined): string | null {
  if (direction === 'lean_yes') {
    return 'LEAN YES';
  }

  if (direction === 'lean_no') {
    return 'LEAN NO';
  }

  if (direction === 'neutral') {
    return 'NEUTRAL';
  }

  return null;
}

/**
 * Get the status badge styling based on the raw step_kind string.
 * This only affects colors; the underlying value is shown as-is.
 */
function getStatusBadgeClass(status: string): string {
  const normalized = status.toLowerCase();

  if (normalized.includes('edge')) {
    return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  }

  if (normalized.includes('bid') || normalized.includes('order')) {
    return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
  }

  if (normalized.includes('scan')) {
    return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  }

  if (normalized.includes('close')) {
    return 'bg-green-500/10 text-green-400 border-green-500/30';
  }

  return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
}

/**
 * MOCK: Live Agent Actions panel component.
 *
 * This component displays a real-time feed of agent actions happening across
 * the AIMM system. It polls the `/api/ai-agent-output/actions` endpoint and can
 * optionally be scoped to a specific market via `marketId` and/or
 * `marketTicker` query parameters. The header can be hidden for embedded
 * placements via the `hideHeader` prop.
 */
export function LiveAgentActions({ marketId, marketTicker, hideHeader }: LiveAgentActionsProps) {
  // Force re-render every second to update relative timestamps
  const [now, setNow] = useState(new Date());
  const [actions, setActions] = useState<LiveAgentAction[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    interface AgentActionDto {
      id: string;
      timestamp: string;
      runId: string;
      stepIndex: number;
      marketTicker?: string;
      stepKind: string;
      stepLoading?: boolean;
      headline?: string;
      summary?: string;
      direction?: Direction;
      stepOutput: StepOutput;
    }

    interface AgentActionsResponse {
      actions: AgentActionDto[];
    }

    const fetchActions = async (): Promise<void> => {
      try {
        const searchParams = new URLSearchParams({ limit: '20' });

        if (marketId) {
          searchParams.set('marketId', marketId);
        }

        if (marketTicker) {
          searchParams.set('marketTicker', marketTicker);
        }

        const response = await fetch(`/api/ai-agent-output/actions?${searchParams.toString()}`);

        if (!response.ok) {
          // eslint-disable-next-line no-console
          console.error('Failed to fetch recent agent actions', response.statusText);
          setHasError(true);
          return;
        }

        const data: AgentActionsResponse = await response.json();

        const hydratedActions: LiveAgentAction[] = data.actions.map(action => ({
          id: action.id,
          timestamp: new Date(action.timestamp),
          runId: action.runId,
          stepIndex: action.stepIndex,
          marketTicker: action.marketTicker,
          stepKind: action.stepKind,
          stepLoading: action.stepLoading,
          headline: action.headline,
          summary: action.summary,
          direction: action.direction,
          stepOutput: action.stepOutput,
        }));

        setActions(hydratedActions);
        setHasError(false);
      } catch (error: unknown) {
        // eslint-disable-next-line no-console
        console.error('Error while fetching recent agent actions', error);
        setHasError(true);
      }
    };

    void fetchActions();

    const interval = setInterval(() => {
      void fetchActions();
    }, 5000);

    return () => clearInterval(interval);
  }, [marketId, marketTicker]);

  return (
    <div className='flex h-full flex-col'>
      {hideHeader ? null : (
        <div className='border-border flex items-center justify-between border-b px-3 py-2.5'>
          <div className='flex items-center gap-1.5'>
            <FlashIcon className='h-4 w-4 text-yellow-400' />
            <h2 className='text-foreground text-sm font-semibold'>Live Agent Actions</h2>
          </div>
          <Badge className='h-5 gap-1 border border-green-500/30 bg-green-500/10 px-1.5 text-[10px] font-medium text-green-400'>
            <span className='h-1 w-1 rounded-full bg-green-400' />
            Active
          </Badge>
        </div>
      )}

      {/* Actions List */}
      <div className='flex-1 space-y-0 overflow-y-auto'>
        {actions.length === 0 && !hasError ? (
          <div className='text-muted-foreground px-3 py-4 text-xs'>No recent agent actions.</div>
        ) : null}

        {hasError ? <div className='text-destructive px-3 py-4 text-xs'>Failed to load live agent actions.</div> : null}

        {actions.map(action => {
          const timeLabel = formatAgentActionTime(action.timestamp, now);
          const dotClass = getTimestampDotClass(action.timestamp, now);
          const agentName = action.marketTicker ?? action.runId;
          const statusLabel = getStatusLabel(action.stepKind);
          const badgeClass = getStatusBadgeClass(action.stepKind);
          const isExpanded = expandedId === action.id;
          const isLoading = action.stepLoading === true;
          const description = action.headline ?? action.summary ?? '';

          const stepOutputRecord = action.stepOutput as Record<string, unknown>;
          const rawProgress = stepOutputRecord.progress;
          const progress = typeof rawProgress === 'number' && Number.isFinite(rawProgress) ? rawProgress : undefined;

          const directionLabel = getDirectionLabel(action.direction);
          const directionBadgeClass = getDirectionBadgeClass(action.direction);

          return (
            <button
              key={action.id}
              type='button'
              onClick={() => {
                if (isLoading) {
                  return;
                }
                setExpandedId(prev => (prev === action.id ? null : action.id));
              }}
              className='border-border flex w-full flex-col gap-1.5 border-b px-3 py-2.5 text-left last:border-b-0'
            >
              {/* Header: market label + timestamp */}
              <div className='flex items-center justify-between gap-2'>
                <span className='text-muted-foreground truncate text-[10px] font-semibold tracking-wide'>
                  {agentName}
                </span>
                <div className='flex items-center gap-1.5'>
                  <span className={cn('h-1 w-1 rounded-full', dotClass)} />
                  <span className='text-muted-foreground text-[10px]' suppressHydrationWarning>
                    {timeLabel}
                  </span>
                </div>
              </div>

              {/* Title + step kind badge */}
              <div className='flex items-start justify-between gap-2'>
                <div className='flex-1'>
                  <p className='text-foreground line-clamp-1 text-xs font-semibold'>
                    {description.length > 0 ? description : statusLabel}
                  </p>
                  {description.length > 0 ? (
                    <p className='text-muted-foreground mt-0.5 line-clamp-2 text-[11px]'>{statusLabel}</p>
                  ) : null}
                </div>
                <Badge
                  variant='outline'
                  className={cn(
                    'h-auto shrink-0 rounded-sm px-1.5 py-0 text-[9px] leading-tight font-semibold uppercase',
                    badgeClass
                  )}
                >
                  {statusLabel}
                </Badge>
              </div>

              {/* Direction + View Output / Loading row */}
              <div className='mt-1 flex items-center justify-between gap-2'>
                {directionLabel ? (
                  <Badge
                    variant='outline'
                    className={cn('h-5 rounded-full px-2 text-[10px] font-semibold tracking-wide', directionBadgeClass)}
                  >
                    {directionLabel}
                  </Badge>
                ) : (
                  <span />
                )}

                {isLoading ? (
                  <span className='text-muted-foreground text-[10px] font-medium'>Loading…</span>
                ) : (
                  <div className='text-primary flex items-center gap-1 text-[10px] font-medium'>
                    <span>View Output</span>
                    <span aria-hidden='true'>▾</span>
                  </div>
                )}
              </div>

              {/* Progress indicator (only when explicit numeric progress is present in step_output) */}
              {typeof progress === 'number' ? (
                <div className='mt-1 flex items-center gap-2'>
                  <div className='bg-muted h-1 flex-1 overflow-hidden rounded-full'>
                    <div className='bg-foreground h-full transition-all' style={{ width: `${progress}%` }} />
                  </div>
                  <span className='text-foreground font-mono text-[10px] font-medium'>{progress}%</span>
                </div>
              ) : null}

              {isExpanded && !isLoading ? (
                <div className='bg-muted/40 text-muted-foreground mt-2 max-h-48 overflow-auto rounded-md px-2 py-1'>
                  <pre className='font-mono text-[10px] leading-snug'>{JSON.stringify(action.stepOutput, null, 2)}</pre>
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
