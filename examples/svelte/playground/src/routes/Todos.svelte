<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  import {
    errorRate,
    queryTimeMin,
    queryTimeMax,
    list,
    editingIndex,
  } from '../lib/stores'

  export let initialFilter: string

  let filter = initialFilter

  const fetchTodos = async ({ filter }: { filter: string }) => {
    console.info('fetchTodos', { filter })

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < $errorRate) {
          return reject(
            new Error(JSON.stringify({ fetchTodos: { filter } }, null, 2)),
          )
        }
        resolve($list.filter((d) => d.name.includes(filter)))
      }, $queryTimeMin + Math.random() * ($queryTimeMax - $queryTimeMin))
    })
  }

  const query = createQuery<any>({
    queryKey: ['todos', { filter }],
    queryFn: () => fetchTodos({ filter }),
  })
</script>

<div>
  <label>
    Filter:{' '}
    <input bind:value={filter} />
  </label>
</div>

{#if $query.status === 'loading'}
  <span>Loading... (Attempt: {$query.failureCount + 1})</span>
{:else if $query.status === 'error'}
  <span>
    Error: {$query.error.message}
    <br />
    <button on:click={() => $query.refetch()}>Retry</button>
  </span>
{:else}
  <ul>
    {#if $query.data}
      {#each $query.data as todo}
        <li>
          {todo.name}{' '}
          <button on:click={() => editingIndex.set(todo.id)}> Edit </button>
        </li>
      {/each}
    {/if}
  </ul>
  <div>
    {#if $query.isFetching}
      <span>
        Background Refreshing... (Attempt: {$query.failureCount + 1})
      </span>
    {:else}
      <span>&nbsp;</span>
    {/if}
  </div>
{/if}
