import {
  onScopeDispose,
  reactive,
  readonly,
  toRefs,
  watch,
  computed,
} from 'vue-demi'
import type { ToRefs } from 'vue-demi'
import type {
  MutateOptions,
  MutateFunction,
  MutationObserverResult,
  MutationObserverOptions,
} from '@tanstack/query-core'
import type { MaybeRefDeep, DistributiveOmit } from './types'
import { MutationObserver } from '@tanstack/query-core'
import { cloneDeepUnref, updateState } from './utils'
import { useQueryClient } from './useQueryClient'
import type { QueryClient } from './queryClient'

type MutationResult<TData, TError, TVariables, TContext> = DistributiveOmit<
  MutationObserverResult<TData, TError, TVariables, TContext>,
  'mutate' | 'reset'
>

export type UseMutationOptions<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> = MaybeRefDeep<MutationObserverOptions<TData, TError, TVariables, TContext>>

type MutateSyncFunction<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> = (
  ...options: Parameters<MutateFunction<TData, TError, TVariables, TContext>>
) => void

export type UseMutationReturnType<
  TData,
  TError,
  TVariables,
  TContext,
  Result = MutationResult<TData, TError, TVariables, TContext>,
> = ToRefs<Readonly<Result>> & {
  mutate: MutateSyncFunction<TData, TError, TVariables, TContext>
  mutateAsync: MutateFunction<TData, TError, TVariables, TContext>
  reset: MutationObserverResult<TData, TError, TVariables, TContext>['reset']
}

export function useMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  mutationOptions: MaybeRefDeep<
    MutationObserverOptions<TData, TError, TVariables, TContext>
  >,
  queryClient?: QueryClient,
): UseMutationReturnType<TData, TError, TVariables, TContext> {
  const client = queryClient || useQueryClient()
  const options = computed(() => {
    return client.defaultMutationOptions(cloneDeepUnref(mutationOptions))
  })
  const observer = new MutationObserver(client, options.value)
  const state = reactive(observer.getCurrentResult())

  const unsubscribe = observer.subscribe((result) => {
    updateState(state, result)
  })

  const mutate = (
    variables: TVariables,
    mutateOptions?: MutateOptions<TData, TError, TVariables, TContext>,
  ) => {
    observer.mutate(variables, mutateOptions).catch(() => {
      // This is intentional
    })
  }

  watch(
    options,
    () => {
      observer.setOptions(options.value)
    },
    { deep: true },
  )

  onScopeDispose(() => {
    unsubscribe()
  })

  const resultRefs = toRefs(readonly(state)) as unknown as ToRefs<
    Readonly<MutationResult<TData, TError, TVariables, TContext>>
  >

  return {
    ...resultRefs,
    mutate,
    mutateAsync: state.mutate,
    reset: state.reset,
  }
}
