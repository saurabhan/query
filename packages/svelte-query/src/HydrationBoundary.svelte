<script lang="ts">
  import type {
    DehydratedState,
    HydrateOptions,
    QueryClient,
  } from '@tanstack/query-core'
  import { useHydrate } from './useHydrate'

  export let state: DehydratedState
  export let options: HydrateOptions | undefined = undefined
  export let queryClient: QueryClient | undefined = undefined

  useHydrate(state, options, queryClient)
</script>

<slot />
