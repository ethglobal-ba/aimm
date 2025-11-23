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
    market_id: string;
    analysis_type: string;
    agent_version: string;
    output_data: object;
    workflow_id?: string;
    step_number?: number;
    topics?: string[];
    stance?: string;
    confidence_score?: number;
  }): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Client not connected');
    }

    const result = await this.client.query(
      `INSERT INTO ai_agent_output
       (market_id, analysis_type, agent_version, output_data, workflow_id, step_number, topics, stance, confidence_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        data.market_id,
        data.analysis_type,
        data.agent_version,
        JSON.stringify(data.output_data),
        data.workflow_id,
        data.step_number,
        data.topics,
        data.stance,
        data.confidence_score,
      ]
    );

    return result.rows[0].id;
  }

  /**
   * Query AI agent output with various filters
   */
  async queryAIAgentOutput(filters: {
    market_id?: string;
    analysis_type?: string;
    stance?: string;
    min_confidence?: number;
    limit?: number;
  }) {
    if (!this.isConnected) {
      throw new Error('Client not connected');
    }

    let query = 'SELECT * FROM ai_agent_output WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (filters.market_id) {
      query += ` AND market_id = $${++paramCount}`;
      params.push(filters.market_id);
    }

    if (filters.analysis_type) {
      query += ` AND analysis_type = $${++paramCount}`;
      params.push(filters.analysis_type);
    }

    if (filters.stance) {
      query += ` AND stance = $${++paramCount}`;
      params.push(filters.stance);
    }

    if (filters.min_confidence !== undefined) {
      query += ` AND confidence_score >= $${++paramCount}`;
      params.push(filters.min_confidence);
    }

    query += ' ORDER BY created_at DESC';

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
    const agentOutputId = await pubsub.insertAIAgentOutput({
      market_id: 'TEST_MARKET_001',
      analysis_type: 'market_analysis',
      agent_version: 'v1.0',
      output_data: {
        topic: 'economic_indicators',
        rationale: 'Analysis of latest employment and inflation data shows mixed signals',
        stance: 'neutral',
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
      workflow_id: 'workflow_123',
      step_number: 1,
      topics: ['employment', 'inflation', 'economic_indicators'],
      stance: 'neutral',
      confidence_score: 0.75
    });

    console.log('Inserted AI agent output with ID:', agentOutputId);

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