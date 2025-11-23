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
  defaultConfigUpdate?: Maybe<defaultConfigUpdate>;
  defaultConfigUpdates: defaultConfigUpdatePage;
  market?: Maybe<market>;
  marketConfig?: Maybe<marketConfig>;
  marketConfigs: marketConfigPage;
  marketStatusChange?: Maybe<marketStatusChange>;
  marketStatusChanges: marketStatusChangePage;
  markets: marketPage;
  ownershipTransfer?: Maybe<ownershipTransfer>;
  ownershipTransfers: ownershipTransferPage;
  priceUpdate?: Maybe<priceUpdate>;
  priceUpdates: priceUpdatePage;
  workflowResult?: Maybe<workflowResult>;
  workflowResults: workflowResultPage;
};


export type QuerydefaultConfigUpdateArgs = {
  id: Scalars['String']['input'];
};


export type QuerydefaultConfigUpdatesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<defaultConfigUpdateFilter>;
};


export type QuerymarketArgs = {
  id: Scalars['String']['input'];
};


export type QuerymarketConfigArgs = {
  id: Scalars['String']['input'];
};


export type QuerymarketConfigsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<marketConfigFilter>;
};


export type QuerymarketStatusChangeArgs = {
  id: Scalars['String']['input'];
};


export type QuerymarketStatusChangesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<marketStatusChangeFilter>;
};


export type QuerymarketsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<marketFilter>;
};


export type QueryownershipTransferArgs = {
  id: Scalars['String']['input'];
};


export type QueryownershipTransfersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<ownershipTransferFilter>;
};


export type QuerypriceUpdateArgs = {
  id: Scalars['String']['input'];
};


export type QuerypriceUpdatesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<priceUpdateFilter>;
};


export type QueryworkflowResultArgs = {
  id: Scalars['String']['input'];
};


export type QueryworkflowResultsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Scalars['String']['input']>;
  orderDirection?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<workflowResultFilter>;
};

export type ViewPageInfo = {
  __typename?: 'ViewPageInfo';
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
};

export type defaultConfigUpdate = {
  __typename?: 'defaultConfigUpdate';
  blockNumber: Scalars['BigInt']['output'];
  driftPercentage: Scalars['BigInt']['output'];
  id: Scalars['String']['output'];
  maxSpend: Scalars['BigInt']['output'];
  slippage: Scalars['BigInt']['output'];
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['String']['output'];
};

export type defaultConfigUpdateFilter = {
  AND?: InputMaybe<Array<InputMaybe<defaultConfigUpdateFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<defaultConfigUpdateFilter>>>;
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

export type defaultConfigUpdatePage = {
  __typename?: 'defaultConfigUpdatePage';
  items: Array<defaultConfigUpdate>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type market = {
  __typename?: 'market';
  createdAt: Scalars['BigInt']['output'];
  eventTicker?: Maybe<Scalars['String']['output']>;
  externalId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastExternalPriceUpdate?: Maybe<Scalars['BigInt']['output']>;
  lastFairPriceUpdate?: Maybe<Scalars['BigInt']['output']>;
  marketName: Scalars['String']['output'];
  maxSpend?: Maybe<Scalars['BigInt']['output']>;
  minPriceDiff?: Maybe<Scalars['BigInt']['output']>;
  optionACurrentExternalPrice?: Maybe<Scalars['BigInt']['output']>;
  optionACurrentFairPrice?: Maybe<Scalars['BigInt']['output']>;
  optionAText: Scalars['String']['output'];
  optionBCurrentExternalPrice?: Maybe<Scalars['BigInt']['output']>;
  optionBCurrentFairPrice?: Maybe<Scalars['BigInt']['output']>;
  optionBText: Scalars['String']['output'];
  platform: Scalars['String']['output'];
  slippage?: Maybe<Scalars['BigInt']['output']>;
  status: Scalars['Int']['output'];
  subtitle: Scalars['String']['output'];
  updatedAt: Scalars['BigInt']['output'];
  volume?: Maybe<Scalars['BigInt']['output']>;
};

export type marketConfig = {
  __typename?: 'marketConfig';
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

export type marketConfigFilter = {
  AND?: InputMaybe<Array<InputMaybe<marketConfigFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<marketConfigFilter>>>;
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

export type marketConfigPage = {
  __typename?: 'marketConfigPage';
  items: Array<marketConfig>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type marketFilter = {
  AND?: InputMaybe<Array<InputMaybe<marketFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<marketFilter>>>;
  createdAt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  eventTicker?: InputMaybe<Scalars['String']['input']>;
  eventTicker_contains?: InputMaybe<Scalars['String']['input']>;
  eventTicker_ends_with?: InputMaybe<Scalars['String']['input']>;
  eventTicker_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  eventTicker_not?: InputMaybe<Scalars['String']['input']>;
  eventTicker_not_contains?: InputMaybe<Scalars['String']['input']>;
  eventTicker_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  eventTicker_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  eventTicker_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  eventTicker_starts_with?: InputMaybe<Scalars['String']['input']>;
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
  lastExternalPriceUpdate?: InputMaybe<Scalars['BigInt']['input']>;
  lastExternalPriceUpdate_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastExternalPriceUpdate_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastExternalPriceUpdate_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  lastExternalPriceUpdate_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastExternalPriceUpdate_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastExternalPriceUpdate_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastExternalPriceUpdate_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  lastFairPriceUpdate?: InputMaybe<Scalars['BigInt']['input']>;
  lastFairPriceUpdate_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastFairPriceUpdate_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastFairPriceUpdate_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  lastFairPriceUpdate_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastFairPriceUpdate_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastFairPriceUpdate_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastFairPriceUpdate_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
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
  optionACurrentExternalPrice?: InputMaybe<Scalars['BigInt']['input']>;
  optionACurrentExternalPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  optionACurrentExternalPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  optionACurrentExternalPrice_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  optionACurrentExternalPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  optionACurrentExternalPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  optionACurrentExternalPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  optionACurrentExternalPrice_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  optionACurrentFairPrice?: InputMaybe<Scalars['BigInt']['input']>;
  optionACurrentFairPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  optionACurrentFairPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  optionACurrentFairPrice_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  optionACurrentFairPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  optionACurrentFairPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  optionACurrentFairPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  optionACurrentFairPrice_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
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
  optionBCurrentExternalPrice?: InputMaybe<Scalars['BigInt']['input']>;
  optionBCurrentExternalPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  optionBCurrentExternalPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  optionBCurrentExternalPrice_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  optionBCurrentExternalPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  optionBCurrentExternalPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  optionBCurrentExternalPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  optionBCurrentExternalPrice_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  optionBCurrentFairPrice?: InputMaybe<Scalars['BigInt']['input']>;
  optionBCurrentFairPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  optionBCurrentFairPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  optionBCurrentFairPrice_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  optionBCurrentFairPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  optionBCurrentFairPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  optionBCurrentFairPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  optionBCurrentFairPrice_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
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
  slippage?: InputMaybe<Scalars['BigInt']['input']>;
  slippage_gt?: InputMaybe<Scalars['BigInt']['input']>;
  slippage_gte?: InputMaybe<Scalars['BigInt']['input']>;
  slippage_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  slippage_lt?: InputMaybe<Scalars['BigInt']['input']>;
  slippage_lte?: InputMaybe<Scalars['BigInt']['input']>;
  slippage_not?: InputMaybe<Scalars['BigInt']['input']>;
  slippage_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  status?: InputMaybe<Scalars['Int']['input']>;
  status_gt?: InputMaybe<Scalars['Int']['input']>;
  status_gte?: InputMaybe<Scalars['Int']['input']>;
  status_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  status_lt?: InputMaybe<Scalars['Int']['input']>;
  status_lte?: InputMaybe<Scalars['Int']['input']>;
  status_not?: InputMaybe<Scalars['Int']['input']>;
  status_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  subtitle?: InputMaybe<Scalars['String']['input']>;
  subtitle_contains?: InputMaybe<Scalars['String']['input']>;
  subtitle_ends_with?: InputMaybe<Scalars['String']['input']>;
  subtitle_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  subtitle_not?: InputMaybe<Scalars['String']['input']>;
  subtitle_not_contains?: InputMaybe<Scalars['String']['input']>;
  subtitle_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  subtitle_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  subtitle_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  subtitle_starts_with?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['BigInt']['input']>;
  updatedAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  updatedAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  updatedAt_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  updatedAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  updatedAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  updatedAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  updatedAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  volume?: InputMaybe<Scalars['BigInt']['input']>;
  volume_gt?: InputMaybe<Scalars['BigInt']['input']>;
  volume_gte?: InputMaybe<Scalars['BigInt']['input']>;
  volume_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
  volume_lt?: InputMaybe<Scalars['BigInt']['input']>;
  volume_lte?: InputMaybe<Scalars['BigInt']['input']>;
  volume_not?: InputMaybe<Scalars['BigInt']['input']>;
  volume_not_in?: InputMaybe<Array<InputMaybe<Scalars['BigInt']['input']>>>;
};

export type marketPage = {
  __typename?: 'marketPage';
  items: Array<market>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type marketStatusChange = {
  __typename?: 'marketStatusChange';
  blockNumber: Scalars['BigInt']['output'];
  id: Scalars['String']['output'];
  marketId: Scalars['String']['output'];
  newStatus: Scalars['Int']['output'];
  oldStatus?: Maybe<Scalars['Int']['output']>;
  platform: Scalars['String']['output'];
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['String']['output'];
};

export type marketStatusChangeFilter = {
  AND?: InputMaybe<Array<InputMaybe<marketStatusChangeFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<marketStatusChangeFilter>>>;
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

export type marketStatusChangePage = {
  __typename?: 'marketStatusChangePage';
  items: Array<marketStatusChange>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ownershipTransfer = {
  __typename?: 'ownershipTransfer';
  blockNumber: Scalars['BigInt']['output'];
  id: Scalars['String']['output'];
  newOwner: Scalars['String']['output'];
  previousOwner: Scalars['String']['output'];
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['String']['output'];
};

export type ownershipTransferFilter = {
  AND?: InputMaybe<Array<InputMaybe<ownershipTransferFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<ownershipTransferFilter>>>;
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

export type ownershipTransferPage = {
  __typename?: 'ownershipTransferPage';
  items: Array<ownershipTransfer>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type priceUpdate = {
  __typename?: 'priceUpdate';
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

export type priceUpdateFilter = {
  AND?: InputMaybe<Array<InputMaybe<priceUpdateFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<priceUpdateFilter>>>;
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

export type priceUpdatePage = {
  __typename?: 'priceUpdatePage';
  items: Array<priceUpdate>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type workflowResult = {
  __typename?: 'workflowResult';
  blockNumber: Scalars['BigInt']['output'];
  finalResult: Scalars['BigInt']['output'];
  id: Scalars['String']['output'];
  resultId: Scalars['BigInt']['output'];
  timestamp: Scalars['BigInt']['output'];
  transactionHash: Scalars['String']['output'];
};

export type workflowResultFilter = {
  AND?: InputMaybe<Array<InputMaybe<workflowResultFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<workflowResultFilter>>>;
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

export type workflowResultPage = {
  __typename?: 'workflowResultPage';
  items: Array<workflowResult>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GetMarketsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMarketsQuery = { __typename?: 'Query', markets: { __typename?: 'marketPage', items: Array<{ __typename?: 'market', id: string, externalId: string, marketName: string, subtitle: string, optionAText: string, optionBText: string, platform: string, status: number, createdAt: any, updatedAt: any, optionACurrentExternalPrice?: any | null, optionBCurrentExternalPrice?: any | null, optionACurrentFairPrice?: any | null, optionBCurrentFairPrice?: any | null, lastExternalPriceUpdate?: any | null, lastFairPriceUpdate?: any | null, volume?: any | null }> } };

export type GetMarketQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetMarketQuery = { __typename?: 'Query', market?: { __typename?: 'market', id: string, externalId: string, marketName: string, subtitle: string, optionAText: string, optionBText: string, platform: string, status: number, createdAt: any, updatedAt: any, optionACurrentExternalPrice?: any | null, optionBCurrentExternalPrice?: any | null, optionACurrentFairPrice?: any | null, optionBCurrentFairPrice?: any | null, lastExternalPriceUpdate?: any | null, lastFairPriceUpdate?: any | null, volume?: any | null } | null };


export const GetMarketsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMarkets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"externalId"}},{"kind":"Field","name":{"kind":"Name","value":"marketName"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"optionAText"}},{"kind":"Field","name":{"kind":"Name","value":"optionBText"}},{"kind":"Field","name":{"kind":"Name","value":"platform"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"optionACurrentExternalPrice"}},{"kind":"Field","name":{"kind":"Name","value":"optionBCurrentExternalPrice"}},{"kind":"Field","name":{"kind":"Name","value":"optionACurrentFairPrice"}},{"kind":"Field","name":{"kind":"Name","value":"optionBCurrentFairPrice"}},{"kind":"Field","name":{"kind":"Name","value":"lastExternalPriceUpdate"}},{"kind":"Field","name":{"kind":"Name","value":"lastFairPriceUpdate"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}}]}}]}}]}}]} as unknown as DocumentNode<GetMarketsQuery, GetMarketsQueryVariables>;
export const GetMarketDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMarket"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"market"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"externalId"}},{"kind":"Field","name":{"kind":"Name","value":"marketName"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"optionAText"}},{"kind":"Field","name":{"kind":"Name","value":"optionBText"}},{"kind":"Field","name":{"kind":"Name","value":"platform"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"optionACurrentExternalPrice"}},{"kind":"Field","name":{"kind":"Name","value":"optionBCurrentExternalPrice"}},{"kind":"Field","name":{"kind":"Name","value":"optionACurrentFairPrice"}},{"kind":"Field","name":{"kind":"Name","value":"optionBCurrentFairPrice"}},{"kind":"Field","name":{"kind":"Name","value":"lastExternalPriceUpdate"}},{"kind":"Field","name":{"kind":"Name","value":"lastFairPriceUpdate"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}}]}}]}}]} as unknown as DocumentNode<GetMarketQuery, GetMarketQueryVariables>;