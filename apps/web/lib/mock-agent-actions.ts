// MOCK DATA: UI-only fake data for the live agent actions panel on the dashboard.
// Replace this with real agent action data from the AIMM system / SDK when wiring production.

export type AgentActionStatus = 'DETECTED_EDGE' | 'PLACING_BID' | 'SCANNING' | 'POSITION_CLOSE';

/**
 * Helper to get a human-readable label for an agent action status.
 */
export function getAgentActionStatusLabel(status: AgentActionStatus): string {
  switch (status) {
    case 'DETECTED_EDGE':
      return 'DETECTED EDGE';
    case 'PLACING_BID':
      return 'PLACING BID';
    case 'SCANNING':
      return 'SCANNING';
    case 'POSITION_CLOSE':
      return 'POSITION CLOSE';
  }
}

/**
 * Helper to format a timestamp as a relative time string (e.g., "Now", "2s ago", "1m ago").
 * This is used for the live updates in the agent actions panel.
 */
export function formatAgentActionTime(timestamp: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - timestamp.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 1) {
    return 'Now';
  } else if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  } else if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes}m ago`;
  } else {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours}h ago`;
  }
}

