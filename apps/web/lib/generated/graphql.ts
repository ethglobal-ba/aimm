/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigInt: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export type Meta = {
  __typename?: 'Meta';
  status?: Maybe<Scalars['JSON']['output']>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  _meta?: Maybe<Meta>;
  defaultConfigUpdates?: Maybe<defaultConfigUpdates>;
  defaultConfigUpdatess: defaultConfigUpdatesPage;
  marketConfigs?: Maybe<marketConfigs>;
  marketConfigss: marketConfigsPage;
  marketStatusChanges?: Maybe<marketStatusChanges>;
  marketStatusChangess: marketStatusChangesPage;
  markets?: Maybe<markets>;
  marketss: marketsPage;
  ownershipTransfers?: Maybe<ownershipTransfers>;
  ownershipTransferss: ownershipTransfersPage;
  priceUpdates?: Maybe<priceUpdates>;
  priceUpdatess: priceUpdatesPage;
  workflowResults?: Maybe<workflowResults>;
  workflowResultss: workflowResultsPage;
};


export type QuerydefaultConfigUpdatesArgs = {
  id: Scalars['String']['input'];
};


export type QuerydefaultConfigUpdatessArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<defaultConfigUpdatesFilter>;
};


export type QuerymarketConfigsArgs = {
  id: Scalars['String']['input'];
};


export type QuerymarketConfigssArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<marketConfigsFilter>;
};


export type QuerymarketStatusChangesArgs = {
  id: Scalars['String']['input'];
};


export type QuerymarketStatusChangessArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<marketStatusChangesFilter>;
};


export type QuerymarketsArgs = {
  id: Scalars['String']['input'];
};


export type QuerymarketssArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<marketsFilter>;
};


export type QueryownershipTransfersArgs = {
  id: Scalars['String']['input'];
};


export type QueryownershipTransferssArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<ownershipTransfersFilter>;
};


export type QuerypriceUpdatesArgs = {
  id: Scalars['String']['input'];
};


export type QuerypriceUpdatessArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<priceUpdatesFilter>;
};


export type QueryworkflowResultsArgs = {
  id: Scalars['String']['input'];
};


export type QueryworkflowResultssArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<workflowResultsFilter>;
};

export type ViewPageInfo = {
  __typename?: 'ViewPageInfo';
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
};

export type defaultConfigUpdates = {
  __typename?: 'defaultConfigUpdates';
  blockNumber: Scalars['BigInt']['output'];
  driftPercentage: Scalars['BigInt']['output'];
  id: Scalars['String']['output'];
  maxSpend: Scalars['BigInt']['output'];
  slippage: Scalars['BigInt']['output'];
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['String']['output'];
};

export type defaultConfigUpdatesFilter = {
  AND?: InputMaybe<Array<InputMaybe<defaultConfigUpdatesFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<defaultConfigUpdatesFilter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  driftPercentage?: InputMaybe<Scalars['BigInt']['input']>;
  driftPercentage_gt?: InputMaybe<Scalars['BigInt']['input']>;
  driftPercentage_gte?: InputMaybe<Scalars['BigInt']['input']>;
  driftPercentage_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  driftPercentage_lt?: InputMaybe<Scalars['BigInt']['input']>;
  driftPercentage_lte?: InputMaybe<Scalars['BigInt']['input']>;
  driftPercentage_not?: InputMaybe<Scalars['BigInt']['input']>;
  driftPercentage_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_ends_with?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  id_starts_with?: InputMaybe<Scalars['String']['input']>;
  maxSpend?: InputMaybe<Scalars['BigInt']['input']>;
  maxSpend_gt?: InputMaybe<Scalars['BigInt']['input']>;
  maxSpend_gte?: InputMaybe<Scalars['BigInt']['input']>;
  maxSpend_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  maxSpend_lt?: InputMaybe<Scalars['BigInt']['input']>;
  maxSpend_lte?: InputMaybe<Scalars['BigInt']['input']>;
  maxSpend_not?: InputMaybe<Scalars['BigInt']['input']>;
  maxSpend_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  slippage?: InputMaybe<Scalars['BigInt']['input']>;
  slippage_gt?: InputMaybe<Scalars['BigInt']['input']>;
  slippage_gte?: InputMaybe<Scalars['BigInt']['input']>;
  slippage_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  slippage_lt?: InputMaybe<Scalars['BigInt']['input']>;
  slippage_lte?: InputMaybe<Scalars['BigInt']['input']>;
  slippage_not?: InputMaybe<Scalars['BigInt']['input']>;
  slippage_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  transactionHash?: InputMaybe<Scalars['String']['input']>;
  transactionHash_contains?: InputMaybe<Scalars['String']['input']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionHash_not?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']['input']>;
};

export type defaultConfigUpdatesPage = {
  __typename?: 'defaultConfigUpdatesPage';
  items: Array<defaultConfigUpdates>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type marketConfigs = {
  __typename?: 'marketConfigs';
  blockNumber: Scalars['BigInt']['output'];
  id: Scalars['String']['output'];
  marketId: Scalars['String']['output'];
  maxSpend: Scalars['BigInt']['output'];
  minPriceDiff: Scalars['BigInt']['output'];
  platform: Scalars['String']['output'];
  slippage: Scalars['BigInt']['output'];
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['String']['output'];
};

export type marketConfigsFilter = {
  AND?: InputMaybe<Array<InputMaybe<marketConfigsFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<marketConfigsFilter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_ends_with?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  id_starts_with?: InputMaybe<Scalars['String']['input']>;
  marketId?: InputMaybe<Scalars['String']['input']>;
  marketId_contains?: InputMaybe<Scalars['String']['input']>;
  marketId_ends_with?: InputMaybe<Scalars['String']['input']>;
  marketId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  marketId_not?: InputMaybe<Scalars['String']['input']>;
  marketId_not_contains?: InputMaybe<Scalars['String']['input']>;
  marketId_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  marketId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  marketId_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  marketId_starts_with?: InputMaybe<Scalars['String']['input']>;
  maxSpend?: InputMaybe<Scalars['BigInt']['input']>;
  maxSpend_gt?: InputMaybe<Scalars['BigInt']['input']>;
  maxSpend_gte?: InputMaybe<Scalars['BigInt']['input']>;
  maxSpend_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  maxSpend_lt?: InputMaybe<Scalars['BigInt']['input']>;
  maxSpend_lte?: InputMaybe<Scalars['BigInt']['input']>;
  maxSpend_not?: InputMaybe<Scalars['BigInt']['input']>;
  maxSpend_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  minPriceDiff?: InputMaybe<Scalars['BigInt']['input']>;
  minPriceDiff_gt?: InputMaybe<Scalars['BigInt']['input']>;
  minPriceDiff_gte?: InputMaybe<Scalars['BigInt']['input']>;
  minPriceDiff_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  minPriceDiff_lt?: InputMaybe<Scalars['BigInt']['input']>;
  minPriceDiff_lte?: InputMaybe<Scalars['BigInt']['input']>;
  minPriceDiff_not?: InputMaybe<Scalars['BigInt']['input']>;
  minPriceDiff_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  platform?: InputMaybe<Scalars['String']['input']>;
  platform_contains?: InputMaybe<Scalars['String']['input']>;
  platform_ends_with?: InputMaybe<Scalars['String']['input']>;
  platform_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  platform_not?: InputMaybe<Scalars['String']['input']>;
  platform_not_contains?: InputMaybe<Scalars['String']['input']>;
  platform_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  platform_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  platform_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  platform_starts_with?: InputMaybe<Scalars['String']['input']>;
  slippage?: InputMaybe<Scalars['BigInt']['input']>;
  slippage_gt?: InputMaybe<Scalars['BigInt']['input']>;
  slippage_gte?: InputMaybe<Scalars['BigInt']['input']>;
  slippage_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  slippage_lt?: InputMaybe<Scalars['BigInt']['input']>;
  slippage_lte?: InputMaybe<Scalars['BigInt']['input']>;
  slippage_not?: InputMaybe<Scalars['BigInt']['input']>;
  slippage_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  transactionHash?: InputMaybe<Scalars['String']['input']>;
  transactionHash_contains?: InputMaybe<Scalars['String']['input']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionHash_not?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']['input']>;
};

export type marketConfigsPage = {
  __typename?: 'marketConfigsPage';
  items: Array<marketConfigs>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type marketStatusChanges = {
  __typename?: 'marketStatusChanges';
  blockNumber: Scalars['BigInt']['output'];
  id: Scalars['String']['output'];
  marketId: Scalars['String']['output'];
  newStatus: Scalars['Int']['output'];
  oldStatus?: Maybe<Scalars['Int']['output']>;
  platform: Scalars['String']['output'];
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['String']['output'];
};

export type marketStatusChangesFilter = {
  AND?: InputMaybe<Array<InputMaybe<marketStatusChangesFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<marketStatusChangesFilter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_ends_with?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  id_starts_with?: InputMaybe<Scalars['String']['input']>;
  marketId?: InputMaybe<Scalars['String']['input']>;
  marketId_contains?: InputMaybe<Scalars['String']['input']>;
  marketId_ends_with?: InputMaybe<Scalars['String']['input']>;
  marketId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  marketId_not?: InputMaybe<Scalars['String']['input']>;
  marketId_not_contains?: InputMaybe<Scalars['String']['input']>;
  marketId_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  marketId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  marketId_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  marketId_starts_with?: InputMaybe<Scalars['String']['input']>;
  newStatus?: InputMaybe<Scalars['Int']['input']>;
  newStatus_gt?: InputMaybe<Scalars['Int']['input']>;
  newStatus_gte?: InputMaybe<Scalars['Int']['input']>;
  newStatus_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  newStatus_lt?: InputMaybe<Scalars['Int']['input']>;
  newStatus_lte?: InputMaybe<Scalars['Int']['input']>;
  newStatus_not?: InputMaybe<Scalars['Int']['input']>;
  newStatus_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  oldStatus?: InputMaybe<Scalars['Int']['input']>;
  oldStatus_gt?: InputMaybe<Scalars['Int']['input']>;
  oldStatus_gte?: InputMaybe<Scalars['Int']['input']>;
  oldStatus_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  oldStatus_lt?: InputMaybe<Scalars['Int']['input']>;
  oldStatus_lte?: InputMaybe<Scalars['Int']['input']>;
  oldStatus_not?: InputMaybe<Scalars['Int']['input']>;
  oldStatus_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  platform?: InputMaybe<Scalars['String']['input']>;
  platform_contains?: InputMaybe<Scalars['String']['input']>;
  platform_ends_with?: InputMaybe<Scalars['String']['input']>;
  platform_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  platform_not?: InputMaybe<Scalars['String']['input']>;
  platform_not_contains?: InputMaybe<Scalars['String']['input']>;
  platform_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  platform_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  platform_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  platform_starts_with?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  transactionHash?: InputMaybe<Scalars['String']['input']>;
  transactionHash_contains?: InputMaybe<Scalars['String']['input']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionHash_not?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']['input']>;
};

export type marketStatusChangesPage = {
  __typename?: 'marketStatusChangesPage';
  items: Array<marketStatusChanges>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type markets = {
  __typename?: 'markets';
  createdAt: Scalars['BigInt']['output'];
  externalId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  marketName: Scalars['String']['output'];
  optionAText: Scalars['String']['output'];
  optionBText: Scalars['String']['output'];
  platform: Scalars['String']['output'];
  status: Scalars['Int']['output'];
  updatedAt: Scalars['BigInt']['output'];
};

export type marketsFilter = {
  AND?: InputMaybe<Array<InputMaybe<marketsFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<marketsFilter>>>;
  createdAt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  externalId?: InputMaybe<Scalars['String']['input']>;
  externalId_contains?: InputMaybe<Scalars['String']['input']>;
  externalId_ends_with?: InputMaybe<Scalars['String']['input']>;
  externalId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  externalId_not?: InputMaybe<Scalars['String']['input']>;
  externalId_not_contains?: InputMaybe<Scalars['String']['input']>;
  externalId_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  externalId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  externalId_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  externalId_starts_with?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_ends_with?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  id_starts_with?: InputMaybe<Scalars['String']['input']>;
  marketName?: InputMaybe<Scalars['String']['input']>;
  marketName_contains?: InputMaybe<Scalars['String']['input']>;
  marketName_ends_with?: InputMaybe<Scalars['String']['input']>;
  marketName_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  marketName_not?: InputMaybe<Scalars['String']['input']>;
  marketName_not_contains?: InputMaybe<Scalars['String']['input']>;
  marketName_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  marketName_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  marketName_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  marketName_starts_with?: InputMaybe<Scalars['String']['input']>;
  optionAText?: InputMaybe<Scalars['String']['input']>;
  optionAText_contains?: InputMaybe<Scalars['String']['input']>;
  optionAText_ends_with?: InputMaybe<Scalars['String']['input']>;
  optionAText_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  optionAText_not?: InputMaybe<Scalars['String']['input']>;
  optionAText_not_contains?: InputMaybe<Scalars['String']['input']>;
  optionAText_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  optionAText_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  optionAText_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  optionAText_starts_with?: InputMaybe<Scalars['String']['input']>;
  optionBText?: InputMaybe<Scalars['String']['input']>;
  optionBText_contains?: InputMaybe<Scalars['String']['input']>;
  optionBText_ends_with?: InputMaybe<Scalars['String']['input']>;
  optionBText_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  optionBText_not?: InputMaybe<Scalars['String']['input']>;
  optionBText_not_contains?: InputMaybe<Scalars['String']['input']>;
  optionBText_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  optionBText_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  optionBText_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  optionBText_starts_with?: InputMaybe<Scalars['String']['input']>;
  platform?: InputMaybe<Scalars['String']['input']>;
  platform_contains?: InputMaybe<Scalars['String']['input']>;
  platform_ends_with?: InputMaybe<Scalars['String']['input']>;
  platform_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  platform_not?: InputMaybe<Scalars['String']['input']>;
  platform_not_contains?: InputMaybe<Scalars['String']['input']>;
  platform_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  platform_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  platform_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  platform_starts_with?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['Int']['input']>;
  status_gt?: InputMaybe<Scalars['Int']['input']>;
  status_gte?: InputMaybe<Scalars['Int']['input']>;
  status_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  status_lt?: InputMaybe<Scalars['Int']['input']>;
  status_lte?: InputMaybe<Scalars['Int']['input']>;
  status_not?: InputMaybe<Scalars['Int']['input']>;
  status_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  updatedAt?: InputMaybe<Scalars['BigInt']['input']>;
  updatedAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  updatedAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  updatedAt_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  updatedAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  updatedAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  updatedAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  updatedAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
};

export type marketsPage = {
  __typename?: 'marketsPage';
  items: Array<markets>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ownershipTransfers = {
  __typename?: 'ownershipTransfers';
  blockNumber: Scalars['BigInt']['output'];
  id: Scalars['String']['output'];
  newOwner: Scalars['String']['output'];
  previousOwner: Scalars['String']['output'];
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['String']['output'];
};

export type ownershipTransfersFilter = {
  AND?: InputMaybe<Array<InputMaybe<ownershipTransfersFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ownershipTransfersFilter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_ends_with?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  id_starts_with?: InputMaybe<Scalars['String']['input']>;
  newOwner?: InputMaybe<Scalars['String']['input']>;
  newOwner_contains?: InputMaybe<Scalars['String']['input']>;
  newOwner_ends_with?: InputMaybe<Scalars['String']['input']>;
  newOwner_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  newOwner_not?: InputMaybe<Scalars['String']['input']>;
  newOwner_not_contains?: InputMaybe<Scalars['String']['input']>;
  newOwner_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  newOwner_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  newOwner_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  newOwner_starts_with?: InputMaybe<Scalars['String']['input']>;
  previousOwner?: InputMaybe<Scalars['String']['input']>;
  previousOwner_contains?: InputMaybe<Scalars['String']['input']>;
  previousOwner_ends_with?: InputMaybe<Scalars['String']['input']>;
  previousOwner_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  previousOwner_not?: InputMaybe<Scalars['String']['input']>;
  previousOwner_not_contains?: InputMaybe<Scalars['String']['input']>;
  previousOwner_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  previousOwner_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  previousOwner_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  previousOwner_starts_with?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  transactionHash?: InputMaybe<Scalars['String']['input']>;
  transactionHash_contains?: InputMaybe<Scalars['String']['input']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionHash_not?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']['input']>;
};

export type ownershipTransfersPage = {
  __typename?: 'ownershipTransfersPage';
  items: Array<ownershipTransfers>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type priceUpdates = {
  __typename?: 'priceUpdates';
  blockNumber: Scalars['BigInt']['output'];
  id: Scalars['String']['output'];
  marketId: Scalars['String']['output'];
  optionAPrice: Scalars['BigInt']['output'];
  optionBPrice: Scalars['BigInt']['output'];
  platform: Scalars['String']['output'];
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type priceUpdatesFilter = {
  AND?: InputMaybe<Array<InputMaybe<priceUpdatesFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<priceUpdatesFilter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_ends_with?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  id_starts_with?: InputMaybe<Scalars['String']['input']>;
  marketId?: InputMaybe<Scalars['String']['input']>;
  marketId_contains?: InputMaybe<Scalars['String']['input']>;
  marketId_ends_with?: InputMaybe<Scalars['String']['input']>;
  marketId_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  marketId_not?: InputMaybe<Scalars['String']['input']>;
  marketId_not_contains?: InputMaybe<Scalars['String']['input']>;
  marketId_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  marketId_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  marketId_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  marketId_starts_with?: InputMaybe<Scalars['String']['input']>;
  optionAPrice?: InputMaybe<Scalars['BigInt']['input']>;
  optionAPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  optionAPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  optionAPrice_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  optionAPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  optionAPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  optionAPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  optionAPrice_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  optionBPrice?: InputMaybe<Scalars['BigInt']['input']>;
  optionBPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  optionBPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  optionBPrice_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  optionBPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  optionBPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  optionBPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  optionBPrice_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  platform?: InputMaybe<Scalars['String']['input']>;
  platform_contains?: InputMaybe<Scalars['String']['input']>;
  platform_ends_with?: InputMaybe<Scalars['String']['input']>;
  platform_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  platform_not?: InputMaybe<Scalars['String']['input']>;
  platform_not_contains?: InputMaybe<Scalars['String']['input']>;
  platform_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  platform_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  platform_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  platform_starts_with?: InputMaybe<Scalars['String']['input']>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  transactionHash?: InputMaybe<Scalars['String']['input']>;
  transactionHash_contains?: InputMaybe<Scalars['String']['input']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionHash_not?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  type_contains?: InputMaybe<Scalars['String']['input']>;
  type_ends_with?: InputMaybe<Scalars['String']['input']>;
  type_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type_not?: InputMaybe<Scalars['String']['input']>;
  type_not_contains?: InputMaybe<Scalars['String']['input']>;
  type_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  type_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  type_starts_with?: InputMaybe<Scalars['String']['input']>;
};

export type priceUpdatesPage = {
  __typename?: 'priceUpdatesPage';
  items: Array<priceUpdates>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type workflowResults = {
  __typename?: 'workflowResults';
  blockNumber: Scalars['BigInt']['output'];
  finalResult: Scalars['BigInt']['output'];
  id: Scalars['String']['output'];
  resultId: Scalars['BigInt']['output'];
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['String']['output'];
};

export type workflowResultsFilter = {
  AND?: InputMaybe<Array<InputMaybe<workflowResultsFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<workflowResultsFilter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  finalResult?: InputMaybe<Scalars['BigInt']['input']>;
  finalResult_gt?: InputMaybe<Scalars['BigInt']['input']>;
  finalResult_gte?: InputMaybe<Scalars['BigInt']['input']>;
  finalResult_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  finalResult_lt?: InputMaybe<Scalars['BigInt']['input']>;
  finalResult_lte?: InputMaybe<Scalars['BigInt']['input']>;
  finalResult_not?: InputMaybe<Scalars['BigInt']['input']>;
  finalResult_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_ends_with?: InputMaybe<Scalars['String']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  id_starts_with?: InputMaybe<Scalars['String']['input']>;
  resultId?: InputMaybe<Scalars['BigInt']['input']>;
  resultId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  resultId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  resultId_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  resultId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  resultId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  resultId_not?: InputMaybe<Scalars['BigInt']['input']>;
  resultId_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  transactionHash?: InputMaybe<Scalars['String']['input']>;
  transactionHash_contains?: InputMaybe<Scalars['String']['input']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionHash_not?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']['input']>;
};

export type workflowResultsPage = {
  __typename?: 'workflowResultsPage';
  items: Array<workflowResults>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GetMarketsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMarketsQuery = { __typename?: 'Query', marketss: { __typename?: 'marketsPage', items: Array<{ __typename?: 'markets', externalId: string, marketName: string, optionAText: string, optionBText: string, platform: string }> } };


export const GetMarketsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMarkets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"marketss"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"externalId"}},{"kind":"Field","name":{"kind":"Name","value":"marketName"}},{"kind":"Field","name":{"kind":"Name","value":"optionAText"}},{"kind":"Field","name":{"kind":"Name","value":"optionBText"}},{"kind":"Field","name":{"kind":"Name","value":"platform"}}]}}]}}]}}]} as unknown as DocumentNode<GetMarketsQuery, GetMarketsQueryVariables>;