import { ref } from 'vue-demi'
import { QueryClient as QC } from '@tanstack/query-core'
import type {
  QueryKey,
  QueryClientConfig,
  SetDataOptions,
  ResetQueryFilters,
  ResetOptions,
  CancelOptions,
  InvalidateQueryFilters,
  InvalidateOptions,
  RefetchQueryFilters,
  RefetchOptions,
  FetchQueryOptions,
  FetchInfiniteQueryOptions,
  InfiniteData,
  DefaultOptions,
  QueryObserverOptions,
  MutationKey,
  MutationObserverOptions,
  QueryFilters,
  MutationFilters,
  QueryState,
  Updater,
} from '@tanstack/query-core'
import type { MaybeRefDeep } from './types'
import { cloneDeepUnref } from './utils'
import { QueryCache } from './queryCache'
import { MutationCache } from './mutationCache'

export class QueryClient extends QC {
  constructor(config: MaybeRefDeep<QueryClientConfig> = {}) {
    const unreffedConfig = cloneDeepUnref(config)
    const vueQueryConfig: QueryClientConfig = {
      defaultOptions: unreffedConfig.defaultOptions,
      queryCache: unreffedConfig.queryCache || new QueryCache(),
      mutationCache: unreffedConfig.mutationCache || new MutationCache(),
    }
    super(vueQueryConfig)
  }

  isRestoring = ref(false)

  isFetching(filters: MaybeRefDeep<QueryFilters> = {}): number {
    return super.isFetching(cloneDeepUnref(filters))
  }

  isMutating(filters: MaybeRefDeep<MutationFilters> = {}): number {
    return super.isMutating(cloneDeepUnref(filters))
  }

  getQueryData<TData = unknown>(
    queryKey: MaybeRefDeep<QueryKey>,
  ): TData | undefined {
    return super.getQueryData(cloneDeepUnref(queryKey))
  }

  getQueriesData<TData = unknown>(
    filters: MaybeRefDeep<QueryFilters>,
  ): [QueryKey, TData | undefined][] {
    return super.getQueriesData(cloneDeepUnref(filters))
  }

  setQueryData<TData>(
    queryKey: MaybeRefDeep<QueryKey>,
    updater: Updater<TData | undefined, TData | undefined>,
    options: MaybeRefDeep<SetDataOptions> = {},
  ): TData | undefined {
    return super.setQueryData(
      cloneDeepUnref(queryKey),
      updater,
      cloneDeepUnref(options),
    )
  }

  setQueriesData<TData>(
    filters: MaybeRefDeep<QueryFilters>,
    updater: Updater<TData | undefined, TData | undefined>,
    options: MaybeRefDeep<SetDataOptions> = {},
  ): [QueryKey, TData | undefined][] {
    return super.setQueriesData(
      cloneDeepUnref(filters),
      updater,
      cloneDeepUnref(options),
    )
  }

  getQueryState<TData = unknown, TError = Error>(
    queryKey: MaybeRefDeep<QueryKey>,
  ): QueryState<TData, TError> | undefined {
    return super.getQueryState(cloneDeepUnref(queryKey))
  }

  removeQueries(filters: MaybeRefDeep<QueryFilters> = {}): void {
    return super.removeQueries(cloneDeepUnref(filters))
  }

  resetQueries<TPageData = unknown>(
    filters: MaybeRefDeep<ResetQueryFilters<TPageData>> = {},
    options: MaybeRefDeep<ResetOptions> = {},
  ): Promise<void> {
    return super.resetQueries(cloneDeepUnref(filters), cloneDeepUnref(options))
  }

  cancelQueries(
    filters: MaybeRefDeep<QueryFilters> = {},
    options: MaybeRefDeep<CancelOptions> = {},
  ): Promise<void> {
    return super.cancelQueries(cloneDeepUnref(filters), cloneDeepUnref(options))
  }

  invalidateQueries<TPageData = unknown>(
    filters: MaybeRefDeep<InvalidateQueryFilters<TPageData>> = {},
    options: MaybeRefDeep<InvalidateOptions> = {},
  ): Promise<void> {
    return super.invalidateQueries(
      cloneDeepUnref(filters),
      cloneDeepUnref(options),
    )
  }

  refetchQueries<TPageData = unknown>(
    filters: MaybeRefDeep<RefetchQueryFilters<TPageData>> = {},
    options: MaybeRefDeep<RefetchOptions> = {},
  ): Promise<void> {
    return super.refetchQueries(
      cloneDeepUnref(filters),
      cloneDeepUnref(options),
    )
  }

  fetchQuery<
    TQueryFnData,
    TError = Error,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
  >(
    options: FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  ): Promise<TData>
  fetchQuery<
    TQueryFnData,
    TError = Error,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
  >(
    options: MaybeRefDeep<
      FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>
    >,
  ): Promise<TData> {
    return super.fetchQuery(cloneDeepUnref(options))
  }

  prefetchQuery<
    TQueryFnData = unknown,
    TError = Error,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
  >(
    options: FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  ): Promise<void>
  prefetchQuery<
    TQueryFnData = unknown,
    TError = Error,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
  >(
    options: MaybeRefDeep<
      FetchQueryOptions<TQueryFnData, TError, TData, TQueryKey>
    >,
  ): Promise<void> {
    return super.prefetchQuery(cloneDeepUnref(options))
  }

  fetchInfiniteQuery<
    TQueryFnData = unknown,
    TError = Error,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
  >(
    options: FetchInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  ): Promise<InfiniteData<TData>>
  fetchInfiniteQuery<
    TQueryFnData,
    TError = Error,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
  >(
    options: MaybeRefDeep<
      FetchInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey>
    >,
  ): Promise<InfiniteData<TData>> {
    return super.fetchInfiniteQuery(cloneDeepUnref(options))
  }

  prefetchInfiniteQuery<
    TQueryFnData = unknown,
    TError = Error,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
  >(
    options: FetchInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  ): Promise<void>
  prefetchInfiniteQuery<
    TQueryFnData,
    TError = Error,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
  >(
    options: MaybeRefDeep<
      FetchInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey>
    >,
  ): Promise<void> {
    return super.prefetchInfiniteQuery(cloneDeepUnref(options))
  }

  setDefaultOptions(options: MaybeRefDeep<DefaultOptions>): void {
    super.setDefaultOptions(cloneDeepUnref(options))
  }

  setQueryDefaults(
    queryKey: MaybeRefDeep<QueryKey>,
    options: MaybeRefDeep<
      Omit<QueryObserverOptions<unknown, any, any, any>, 'queryKey'>
    >,
  ): void {
    super.setQueryDefaults(cloneDeepUnref(queryKey), cloneDeepUnref(options))
  }

  getQueryDefaults(
    queryKey: MaybeRefDeep<QueryKey>,
  ): QueryObserverOptions<any, any, any, any, any> {
    return super.getQueryDefaults(cloneDeepUnref(queryKey))
  }

  setMutationDefaults(
    mutationKey: MaybeRefDeep<MutationKey>,
    options: MaybeRefDeep<MutationObserverOptions<any, any, any, any>>,
  ): void {
    super.setMutationDefaults(
      cloneDeepUnref(mutationKey),
      cloneDeepUnref(options),
    )
  }

  getMutationDefaults(
    mutationKey: MaybeRefDeep<MutationKey>,
  ): MutationObserverOptions<any, any, any, any> {
    return super.getMutationDefaults(cloneDeepUnref(mutationKey))
  }
}
