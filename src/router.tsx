import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'
import { DefaultCatchBoundary, RootPending } from './components'
import { logServerError } from './lib'

export function getRouter(queryClient?: QueryClient) {
  const finalQueryClient =
    queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: {
          gcTime: 1000 * 60 * 60 * 24, // 24 hours
        },
        mutations: {
          onError: (error) => logServerError(error),
        },
      },
    })
  const router = createRouter({
    routeTree,
    defaultErrorComponent: DefaultCatchBoundary,
    defaultPendingComponent: RootPending,
    scrollRestoration: true,
    defaultPreloadStaleTime: 1 * 60 * 1000,
    context: {
      queryClient: finalQueryClient,
      session: null,
      user: undefined,
    },
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient: finalQueryClient,
    // optional:
    // handleRedirects: true,
    // wrapQueryClient: true,
  })

  return router
}
