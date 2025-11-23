import 'server-only';

import { Pool, type QueryResult, type QueryResultRow } from 'pg';

type SqlPrimitive = string | number | boolean | Date | null;
export type SqlValue = SqlPrimitive | SqlValue[] | { [key: string]: SqlValue };

declare global {
  // Global augmentation to keep a single Pool instance across hot reloads in development.
  // eslint-disable-next-line no-var
  var __aimm_pg_pool: Pool | undefined;
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required for Postgres connection');
}

const createPool = (): Pool =>
  new Pool({
    connectionString: databaseUrl,
  });

const pool: Pool =
  globalThis.__aimm_pg_pool ??
  (() => {
    const newPool = createPool();

    if (process.env.NODE_ENV !== 'production') {
      globalThis.__aimm_pg_pool = newPool;
    }

    return newPool;
  })();

export async function query<T extends QueryResultRow>(text: string, params?: SqlValue[]): Promise<QueryResult<T>> {
  const client = await pool.connect();

  try {
    return await client.query<T>(text, params);
  } finally {
    client.release();
  }
}
