import { isVue2 } from 'vue-demi'
import type { QueryClientConfig } from '@tanstack/query-core'

import { QueryClient } from './queryClient'
import { getClientKey } from './utils'
import { setupDevtools } from './devtools/devtools'
import type { MaybeRefDeep } from './types'

type ClientPersister = (client: QueryClient) => [() => void, Promise<void>]

interface CommonOptions {
  queryClientKey?: string
  clientPersister?: ClientPersister
}

interface ConfigOptions extends CommonOptions {
  queryClientConfig?: MaybeRefDeep<QueryClientConfig>
}

interface ClientOptions extends CommonOptions {
  queryClient?: QueryClient
}

export type VueQueryPluginOptions = ConfigOptions | ClientOptions

export const VueQueryPlugin = {
  install: (app: any, options: VueQueryPluginOptions = {}) => {
    const clientKey = getClientKey(options.queryClientKey)
    let client: QueryClient

    if ('queryClient' in options && options.queryClient) {
      client = options.queryClient
    } else {
      const clientConfig =
        'queryClientConfig' in options ? options.queryClientConfig : undefined
      client = new QueryClient(clientConfig)
    }

    client.mount()
    let persisterUnmount = () => {
      // noop
    }

    if (options.clientPersister) {
      client.isRestoring.value = true
      const [unmount, promise] = options.clientPersister(client)
      persisterUnmount = unmount
      promise.then(() => {
        client.isRestoring.value = false
      })
    }

    const cleanup = () => {
      client.unmount()
      persisterUnmount()
    }

    if (app.onUnmount) {
      app.onUnmount(cleanup)
    } else {
      const originalUnmount = app.unmount
      app.unmount = function vueQueryUnmount() {
        cleanup()
        originalUnmount()
      }
    }

    /* istanbul ignore next */
    if (isVue2) {
      app.mixin({
        beforeCreate() {
          // HACK: taken from provide(): https://github.com/vuejs/composition-api/blob/master/src/apis/inject.ts#L30
          if (!this._provided) {
            const provideCache = {}
            Object.defineProperty(this, '_provided', {
              get: () => provideCache,
              set: (v) => Object.assign(provideCache, v),
            })
          }

          this._provided[clientKey] = client

          if (process.env.NODE_ENV === 'development') {
            if (this === this.$root) {
              setupDevtools(this, client)
            }
          }
        },
      })
    } else {
      app.provide(clientKey, client)

      if (process.env.NODE_ENV === 'development') {
        setupDevtools(app, client)
      }
    }
  },
}
