/**
 * Example TypeScript code demonstrating PostgreSQL pub/sub functionality
 * for AI agent output notifications
 */

import { Client } from 'pg';

interface AIAgentNotification {
  table: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  run_id: string;  // Part of composite key
  step_index: number;  // Part of composite key
  market_id: string;
  market_ticker?: string;
  step_kind: string;
  headline?: string;
  direction?: 'lean_yes' | 'lean_no' | 'neutral';
  timestamp: number;
}

class AIAgentPubSub {
  private client: Client;
  private isConnected = false;

  constructor(connectionString: string) {
    this.client = new Client({
      connectionString,
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
    this.isConnected = true;
    console.log('Connected to PostgreSQL for pub/sub');
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.end();
      this.isConnected = false;
      console.log('Disconnected from PostgreSQL');
    }
  }

  /**
   * Subscribe to AI agent output changes
   * @param callback Function to handle notifications
   */
  async subscribeToAIAgentOutputChanges(
    callback: (notification: AIAgentNotification) => void
  ): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Client not connected');
    }

    // Listen for notifications on the ai_agent_output_changes channel
    await this.client.query('LISTEN ai_agent_output_changes');

    this.client.on('notification', (msg) => {
      if (msg.channel === 'ai_agent_output_changes' && msg.payload) {
        try {
          const notification: AIAgentNotification = JSON.parse(msg.payload);
          callback(notification);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      }
    });

    console.log('Subscribed to AI agent output changes');
  }

  /**
   * Insert new AI agent output (for testing)
   */
  async insertAIAgentOutput(data: {
    run_id: string;
    step_index: number;
    market_id: string;
    market_ticker?: string;
    step_kind: string;
    step_output: object;
    headline?: string;
    summary?: string;
    direction?: 'lean_yes' | 'lean_no' | 'neutral';
    agent_version: string;
    model_version?: string;
    confidence?: number;
    price_scale?: string;
    run_started_at?: Date;
    run_finished_at?: Date;
  }): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Client not connected');
    }

    await this.client.query(
      `INSERT INTO ai_agent_output
       (run_id, step_index, market_id, market_ticker, step_kind, step_output, headline, summary, direction,
        agent_version, model_version, confidence, price_scale, run_started_at, run_finished_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        data.run_id,
        data.step_index,
        data.market_id,
        data.market_ticker,
        data.step_kind,
        JSON.stringify(data.step_output),
        data.headline,
        data.summary,
        data.direction,
        data.agent_version,
        data.model_version,
        data.confidence,
        data.price_scale || 'cents',
        data.run_started_at,
        data.run_finished_at,
      ]
    );
  }

  /**
   * Query AI agent output with various filters
   */
  async queryAIAgentOutput(filters: {
    run_id?: string;
    market_id?: string;
    step_kind?: string;
    direction?: string;
    min_confidence?: number;
    limit?: number;
  }) {
    if (!this.isConnected) {
      throw new Error('Client not connected');
    }

    let query = 'SELECT * FROM ai_agent_output WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (filters.run_id) {
      query += ` AND run_id = $${++paramCount}`;
      params.push(filters.run_id);
    }

    if (filters.market_id) {
      query += ` AND market_id = $${++paramCount}`;
      params.push(filters.market_id);
    }

    if (filters.step_kind) {
      query += ` AND step_kind = $${++paramCount}`;
      params.push(filters.step_kind);
    }

    if (filters.direction) {
      query += ` AND direction = $${++paramCount}`;
      params.push(filters.direction);
    }

    if (filters.min_confidence !== undefined) {
      query += ` AND confidence >= $${++paramCount}`;
      params.push(filters.min_confidence);
    }

    query += ' ORDER BY run_started_at DESC, step_index ASC';

    if (filters.limit) {
      query += ` LIMIT $${++paramCount}`;
      params.push(filters.limit);
    }

    const result = await this.client.query(query, params);
    return result.rows;
  }
}

// Example usage
async function example() {
  const pubsub = new AIAgentPubSub(
    'postgresql://postgres:password@localhost:5432/aimm-fullstack'
  );

  try {
    await pubsub.connect();

    // Subscribe to changes
    await pubsub.subscribeToAIAgentOutputChanges((notification) => {
      console.log('Received notification:', notification);

      // Handle different types of changes
      switch (notification.action) {
        case 'INSERT':
          console.log(`New AI step: ${notification.step_kind} for ${notification.market_ticker || notification.market_id} (${notification.headline || 'No headline'})`);
          break;
        case 'UPDATE':
          console.log(`Updated AI step: ${notification.step_kind} for ${notification.market_ticker || notification.market_id}`);
          break;
        case 'DELETE':
          console.log(`Deleted AI step: ${notification.step_kind} for ${notification.market_ticker || notification.market_id}`);
          break;
      }
    });

    // Example: Insert some test data
    await pubsub.insertAIAgentOutput({
      run_id: 'test_run_001',
      step_index: 1,
      market_id: 'TEST_MARKET_001',
      market_ticker: 'EMPLOYMENT-2025',
      step_kind: 'ANALYZE_RULES',
      step_output: {
        topic: 'economic_indicators',
        rationale: 'Analysis of latest employment and inflation data shows mixed signals',
        confidence: 0.75,
        factors: [
          {
            factor: 'unemployment_rate',
            impact: 'negative',
            weight: 0.3
          },
          {
            factor: 'inflation_trends',
            impact: 'positive',
            weight: 0.7
          }
        ]
      },
      headline: 'Research suggests 75¢ fair value',
      summary: 'Economic indicators show mixed signals with moderate confidence',
      direction: 'neutral',
      agent_version: 'v1.0',
      model_version: 'claude-3.5-sonnet',
      confidence: 0.75,
      run_started_at: new Date()
    });

    console.log('Inserted AI agent output step 1');

    // Query the data
    const results = await pubsub.queryAIAgentOutput({
      market_id: 'TEST_MARKET_001',
      limit: 10
    });

    console.log('Query results:', results);

    // Keep the connection alive to receive notifications
    // In a real application, you would handle this differently
    console.log('Listening for notifications... (press Ctrl+C to exit)');

  } catch (error) {
    console.error('Error:', error);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  process.exit(0);
});

export { AIAgentPubSub, type AIAgentNotification };

// Uncomment to run the example
// example().catch(console.error);