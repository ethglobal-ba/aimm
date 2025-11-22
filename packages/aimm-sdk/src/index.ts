// Indexer data queries (Ponder)
export * from './indexer'

// Contract interactions (Wagmi)
export * from './contract'

// Frontend-compatible layer (main interface for web apps)
export * from './frontend-compat'

// Re-export shared utilities with namespace to avoid conflicts
export * as IndexerTypes from './shared/types'
export * as IndexerUtils from './shared/utils'