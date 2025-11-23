import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetMarketsDocument = gql`
    query GetMarkets {
  markets {
    items {
      id
      externalId
      marketName
      subtitle
      optionAText
      optionBText
      platform
      status
      createdAt
      updatedAt
      optionACurrentExternalPrice
      optionBCurrentExternalPrice
      optionACurrentFairPrice
      optionBCurrentFairPrice
      lastExternalPriceUpdate
      lastFairPriceUpdate
      volume
    }
  }
}
    `;

/**
 * __useGetMarketsQuery__
 *
 * To run a query within a React component, call `useGetMarketsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMarketsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMarketsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetMarketsQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetMarketsQuery, Types.GetMarketsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetMarketsQuery, Types.GetMarketsQueryVariables>(GetMarketsDocument, options);
      }
export function useGetMarketsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetMarketsQuery, Types.GetMarketsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetMarketsQuery, Types.GetMarketsQueryVariables>(GetMarketsDocument, options);
        }
export function useGetMarketsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetMarketsQuery, Types.GetMarketsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetMarketsQuery, Types.GetMarketsQueryVariables>(GetMarketsDocument, options);
        }
export type GetMarketsQueryHookResult = ReturnType<typeof useGetMarketsQuery>;
export type GetMarketsLazyQueryHookResult = ReturnType<typeof useGetMarketsLazyQuery>;
export type GetMarketsSuspenseQueryHookResult = ReturnType<typeof useGetMarketsSuspenseQuery>;
export type GetMarketsQueryResult = Apollo.QueryResult<Types.GetMarketsQuery, Types.GetMarketsQueryVariables>;
export const GetMarketDocument = gql`
    query GetMarket($id: String!) {
  market(id: $id) {
    id
    externalId
    marketName
    subtitle
    optionAText
    optionBText
    platform
    status
    createdAt
    updatedAt
    optionACurrentExternalPrice
    optionBCurrentExternalPrice
    optionACurrentFairPrice
    optionBCurrentFairPrice
    lastExternalPriceUpdate
    lastFairPriceUpdate
    volume
  }
}
    `;

/**
 * __useGetMarketQuery__
 *
 * To run a query within a React component, call `useGetMarketQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMarketQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMarketQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetMarketQuery(baseOptions: Apollo.QueryHookOptions<Types.GetMarketQuery, Types.GetMarketQueryVariables> & ({ variables: Types.GetMarketQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetMarketQuery, Types.GetMarketQueryVariables>(GetMarketDocument, options);
      }
export function useGetMarketLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetMarketQuery, Types.GetMarketQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetMarketQuery, Types.GetMarketQueryVariables>(GetMarketDocument, options);
        }
export function useGetMarketSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetMarketQuery, Types.GetMarketQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetMarketQuery, Types.GetMarketQueryVariables>(GetMarketDocument, options);
        }
export type GetMarketQueryHookResult = ReturnType<typeof useGetMarketQuery>;
export type GetMarketLazyQueryHookResult = ReturnType<typeof useGetMarketLazyQuery>;
export type GetMarketSuspenseQueryHookResult = ReturnType<typeof useGetMarketSuspenseQuery>;
export type GetMarketQueryResult = Apollo.QueryResult<Types.GetMarketQuery, Types.GetMarketQueryVariables>;