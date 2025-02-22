import { fireEvent, render, screen, waitFor } from 'solid-testing-library'

import { createEffect, createRenderEffect, createSignal, Show } from 'solid-js'
import { createQuery, QueryCache, QueryClientProvider, useIsFetching } from '..'
import { createQueryClient, queryKey, setActTimeout, sleep } from './utils'

describe('useIsFetching', () => {
  // See https://github.com/tannerlinsley/react-query/issues/105
  it('should update as queries start and stop fetching', async () => {
    const queryCache = new QueryCache()
    const queryClient = createQueryClient({ queryCache })
    const key = queryKey()

    function IsFetching() {
      const isFetching = useIsFetching()
      return <div>isFetching: {isFetching()}</div>
    }

    function Query() {
      const [ready, setReady] = createSignal(false)

      createQuery(() => ({
        queryKey: key,
        queryFn: async () => {
          await sleep(50)
          return 'test'
        },
        enabled: ready(),
      }))

      return <button onClick={() => setReady(true)}>setReady</button>
    }

    function Page() {
      return (
        <div>
          <IsFetching />
          <Query />
        </div>
      )
    }

    render(() => (
      <QueryClientProvider client={queryClient}>
        <Page />
      </QueryClientProvider>
    ))

    await screen.findByText('isFetching: 0')
    fireEvent.click(screen.getByRole('button', { name: /setReady/i }))
    await screen.findByText('isFetching: 1')
    await screen.findByText('isFetching: 0')
  })

  it('should not update state while rendering', async () => {
    const queryCache = new QueryCache()
    const queryClient = createQueryClient({ queryCache })

    const key1 = queryKey()
    const key2 = queryKey()

    const isFetchings: number[] = []

    function IsFetching() {
      const isFetching = useIsFetching()
      createRenderEffect(() => {
        isFetchings.push(isFetching())
      })
      return null
    }

    function FirstQuery() {
      createQuery(() => ({
        queryKey: key1,
        queryFn: async () => {
          await sleep(150)
          return 'data'
        },
      }))
      return null
    }

    function SecondQuery() {
      createQuery(() => ({
        queryKey: key2,
        queryFn: async () => {
          await sleep(200)
          return 'data'
        },
      }))
      return null
    }

    function Page() {
      const [renderSecond, setRenderSecond] = createSignal(false)

      createEffect(() => {
        setActTimeout(() => {
          setRenderSecond(true)
        }, 100)
      })

      return (
        <>
          <IsFetching />
          <FirstQuery />
          <Show when={renderSecond()}>
            <SecondQuery />
          </Show>
        </>
      )
    }

    render(() => (
      <QueryClientProvider client={queryClient}>
        <Page />
      </QueryClientProvider>
    ))
    // unlike react, Updating renderSecond wont cause a rerender for FirstQuery
    await waitFor(() => expect(isFetchings).toEqual([0, 1, 2, 1, 0]))
  })

  it('should be able to filter', async () => {
    const queryClient = createQueryClient()
    const key1 = queryKey()
    const key2 = queryKey()

    const isFetchings: number[] = []

    function One() {
      createQuery(() => ({
        queryKey: key1,
        queryFn: async () => {
          await sleep(10)
          return 'test'
        },
      }))
      return null
    }

    function Two() {
      createQuery(() => ({
        queryKey: key2,
        queryFn: async () => {
          await sleep(20)
          return 'test'
        },
      }))
      return null
    }

    function Page() {
      const [started, setStarted] = createSignal(false)
      const isFetching = useIsFetching(() => ({
        filters: {
          queryKey: key1,
        },
      }))

      createRenderEffect(() => {
        isFetchings.push(isFetching())
      })

      return (
        <div>
          <button onClick={() => setStarted(true)}>setStarted</button>
          <div>isFetching: {isFetching()}</div>
          <Show when={started()}>
            <>
              <One />
              <Two />
            </>
          </Show>
        </div>
      )
    }

    render(() => (
      <QueryClientProvider client={queryClient}>
        <Page />
      </QueryClientProvider>
    ))

    await screen.findByText('isFetching: 0')
    fireEvent.click(screen.getByRole('button', { name: /setStarted/i }))
    await screen.findByText('isFetching: 1')
    await screen.findByText('isFetching: 0')
    // at no point should we have isFetching: 2
    expect(isFetchings).toEqual(expect.not.arrayContaining([2]))
  })

  it('should show the correct fetching state when mounted after a query', async () => {
    const queryClient = createQueryClient()
    const key = queryKey()

    function Page() {
      createQuery(() => ({
        queryKey: key,
        queryFn: async () => {
          await sleep(10)
          return 'test'
        },
      }))

      const isFetching = useIsFetching()

      return (
        <div>
          <div>isFetching: {isFetching()}</div>
        </div>
      )
    }

    render(() => (
      <QueryClientProvider client={queryClient}>
        <Page />
      </QueryClientProvider>
    ))

    await screen.findByText('isFetching: 1')
    await screen.findByText('isFetching: 0')
  })

  it('should use provided custom queryClient', async () => {
    const queryClient = createQueryClient()
    const key = queryKey()

    function Page() {
      createQuery(
        () => ({
          queryKey: key,
          queryFn: async () => {
            await sleep(10)
            return 'test'
          },
        }),
        () => queryClient,
      )

      const isFetching = useIsFetching(() => ({ queryClient }))

      return (
        <div>
          <div>isFetching: {isFetching}</div>
        </div>
      )
    }

    render(() => <Page></Page>)

    await screen.findByText('isFetching: 1')
  })
})
