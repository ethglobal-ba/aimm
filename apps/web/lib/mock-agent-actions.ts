// MOCK DATA: UI-only fake data for the live agent actions panel on the dashboard.
// Replace this with real agent action data from the AIMM system / SDK when wiring production.

export type AgentActionStatus = 'DETECTED_EDGE' | 'PLACING_BID' | 'SCANNING' | 'POSITION_CLOSE';

export interface AgentAction {
  id: string;
  /** Timestamp when the action was initiated */
  timestamp: Date;
  /** Name/identifier of the agent performing the action */
  agentName: string;
  /** Current status of the agent action */
  status: AgentActionStatus;
  /** Human-readable description of what the agent is doing */
  description: string;
  /** Progress percentage (0-100) */
  progress: number;
}

/**
 * MOCK DATA: UI-only fake data for the live agent actions panel.
 *
 * These actions simulate real-time agent activity. In production, this will be
 * replaced by live data from the AIMM system via WebSocket or polling.
 */
export const mockAgentActions: AgentAction[] = [
  {
    id: '1',
    agentName: 'BTC-2024-100K',
    status: 'DETECTED_EDGE',
    description: 'Fair value divergence > 12%',
    progress: 94,
    timestamp: new Date(Date.now() - 0), // Now
  },
  {
    id: '2',
    agentName: 'SPX-LAUNCH',
    status: 'PLACING_BID',
    description: 'Limit Buy 5000 shares @ $0.72',
    progress: 88,
    timestamp: new Date(Date.now() - 2000), // 2s ago
  },
  {
    id: '3',
    agentName: 'FED-DEC-CUT',
    status: 'SCANNING',
    description: 'Checking Polimarket/Kalshi spreads',
    progress: 0,
    timestamp: new Date(Date.now() - 15000), // 15s ago
  },
  {
    id: '4',
    agentName: 'TS-ENGAGE',
    status: 'POSITION_CLOSE',
    description: 'Target profit reached (+15%)',
    progress: 100,
    timestamp: new Date(Date.now() - 32000), // 32s ago
  },
];

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

