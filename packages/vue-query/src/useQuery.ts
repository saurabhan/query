import type { ToRefs, UnwrapRef } from 'vue-demi'
import { QueryObserver } from '@tanstack/query-core'
import type {
  QueryKey,
  QueryObserverResult,
  DefinedQueryObserverResult,
  WithRequired,
  QueryObserverOptions,
} from '@tanstack/query-core'
import { useBaseQuery } from './useBaseQuery'
import type { UseBaseQueryReturnType } from './useBaseQuery'
import type { DistributiveOmit, MaybeRefDeep } from './types'
import type { QueryClient } from './queryClient'

export type UseQueryOptions<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = {
  [Property in keyof QueryObserverOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey
  >]: Property extends 'queryFn'
    ? QueryObserverOptions<
        TQueryFnData,
        TError,
        TData,
        TQueryData,
        UnwrapRef<TQueryKey>
      >[Property]
    : MaybeRefDeep<
        WithRequired<
          QueryObserverOptions<
            TQueryFnData,
            TError,
            TData,
            TQueryData,
            TQueryKey
          >,
          'queryKey'
        >[Property]
      >
}

export type UseQueryReturnType<TData, TError> = DistributiveOmit<
  UseBaseQueryReturnType<TData, TError>,
  'refetch'
> & {
  refetch: QueryObserverResult<TData, TError>['refetch']
}

export type UseQueryDefinedReturnType<TData, TError> = DistributiveOmit<
  ToRefs<Readonly<DefinedQueryObserverResult<TData, TError>>>,
  'refetch'
> & {
  suspense: () => Promise<QueryObserverResult<TData, TError>>
  refetch: QueryObserverResult<TData, TError>['refetch']
}

export function useQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryFnData,
    TQueryKey
  > & {
    initialData?: undefined
  },
  queryClient?: QueryClient,
): UseQueryReturnType<TData, TError>

export function useQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryFnData,
    TQueryKey
  > & {
    initialData: TQueryFnData | (() => TQueryFnData)
  },
  queryClient?: QueryClient,
): UseQueryDefinedReturnType<TData, TError>

export function useQuery<
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient,
):
  | UseQueryReturnType<TData, TError>
  | UseQueryDefinedReturnType<TData, TError> {
  const result = useBaseQuery(QueryObserver, options, queryClient)

  return {
    ...result,
    refetch: result.refetch.value,
  }
}
