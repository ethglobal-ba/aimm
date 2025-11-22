import { createClient } from '@ponder/client';

// Default indexer URL - can be overridden when creating the client
export const DEFAULT_INDEXER_URL = 'http://localhost:42069';

/**
 * Create a typed Ponder client instance
 * @param baseUrl - The base URL of the Ponder server (defaults to localhost:42069)
 * @param schema - The Ponder schema object (optional)
 */
export function createPonderClient(
  baseUrl: string = DEFAULT_INDEXER_URL,
  schema?: any
) {
  return createClient(baseUrl, { schema });
}

// Re-export all Drizzle utilities from @ponder/client for convenience
export {
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  and,
  or,
  not,
  isNull,
  isNotNull,
  inArray,
  notInArray,
  exists,
  notExists,
  between,
  notBetween,
  like,
  notLike,
  ilike,
  notIlike,
  sql,
  count,
  countDistinct,
  avg,
  avgDistinct,
  sum,
  sumDistinct,
  max,
  min,
  desc,
  asc,
} from '@ponder/client';