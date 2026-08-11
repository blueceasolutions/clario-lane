import * as React from 'react'
import {
  Outlet,
  createRootRouteWithContext,
  useLocation,
  useRouter,
} from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import Navbar from '@/components/navbar'
import { AuthProvider } from '@/context/auth-provider'
import { HelmetProvider } from 'react-helmet-async'
import { SeoHead } from '@/components/shared'

// Importing directly rather than from the '@/components' barrel: that
// barrel's `export *` chain (via ./dashboard and ./gamification) transitively
// reaches recharts- and canvas-confetti-using components. __root.tsx wraps
// every route including the public landing page, so pulling those in here
// put ~450KB of chart/confetti vendor code in the eagerly-loaded bundle.
import { Footer } from '@/components/footer'
import { SettingsProvider } from '@/components/theme/settings-provider'
import { FloatingActionButton } from '@/components/feedback/FloatingActionButton'
import { RootPending } from '@/components/Skeletons/root-pending'
import { Copyright } from '@/components/copyright'
import { ReferralModal } from '@/components/referral-modal'
import type { Session } from '@supabase/supabase-js'
import type { UserTable } from '@/types'
import {
  useOnboardingFlow,
  useOnboardingStore,
  type OnboardingType,
} from '@/store'

type RootRouteContext = {
  queryClient: QueryClient
  session: Session | null
  user: UserTable | undefined
}

import { fetchSession, fetchUserProfile } from '@/integration'

// Dev-only tooling: import.meta.env.PROD is a compile-time constant, so
// production builds dead-code-eliminate the dynamic import() entirely
// rather than relying on these packages' own NODE_ENV no-op behavior.
const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : React.lazy(() =>
      import('@tanstack/react-router-devtools').then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    )

const ReactQueryDevtools = import.meta.env.PROD
  ? () => null
  : React.lazy(() =>
      import('@tanstack/react-query-devtools').then((res) => ({
        default: res.ReactQueryDevtools,
      })),
    )

export const Route = createRootRouteWithContext<RootRouteContext>()({
  component: RootComponent,
  pendingComponent: RootPending,
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(fetchSession)
    let user = undefined

    if (session) {
      try {
        user = await context.queryClient.ensureQueryData(fetchUserProfile)
      } catch (e) {
        console.error('Failed to fetch user profile', e)
      }
    }

    if (user) {
      useOnboardingStore.setState({
        ...(user as unknown as Partial<OnboardingType>),
      })
      if (user?.onboarding_completed) {
        useOnboardingFlow.setState({ current_step: 6 })
      } else {
        useOnboardingFlow.setState({ current_step: 5 })
      }
    }

    let continent = getContinent()
    if (!continent) {
      // Fetch user location and store in localStorage
      axios
        .get('https://ipapi.co/json/')
        .then((response) => {
          localStorage.setItem(
            USER_LOCATION,
            JSON.stringify(response.data.continent_code),
          )
          continent = response.data.continent_code
        })
        .catch((error) => {
          console.error('Error fetching user location:', error)
        })
    }

    return { ...context, session, user, continent }
  },
})

// Create a persister
// const persister = createSyncStoragePersister({
//   storage: window.localStorage,
// })

import { clientEnv } from '@/config/env'
import { useEffect } from 'react'
import ReactGA from 'react-ga4'

import { REF_KEYWORD, USER_LOCATION } from '@/lib/constants'
import axios from 'axios'
import { getContinent } from '@/lib'

function RootComponent() {
  const pathname = useLocation().pathname
  const isValidRoute =
    pathname.includes('onboarding') || pathname.includes('practice')

  const hideFooterRoutes =
    pathname.includes('onboarding') || pathname.includes('dashboard')

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const ref = searchParams.get(REF_KEYWORD)
    if (ref) {
      localStorage.setItem(REF_KEYWORD, ref)
    }
  }, [])

  useEffect(() => {
    const gaKey = clientEnv.VITE_GOOGLE_ANALYTICS_KEY
    if (gaKey) {
      ReactGA.initialize(gaKey)
    }
  }, [])

  useEffect(() => {
    if (clientEnv.VITE_GOOGLE_ANALYTICS_KEY) {
      ReactGA.send({ hitType: 'pageview', page: pathname, title: pathname })
    }
  }, [pathname])

  const { continent } = Route.useRouteContext()
  const router = useRouter()

  useEffect(() => {
    if (!continent) {
      router.invalidate({ sync: true })
    }
  }, [continent])

  return (
    <React.Fragment>
      <HelmetProvider>
        <SeoHead
          title='Clariolane'
          description='Master speed reading and comprehension with Clariolane. Interactive exercises and progress tracking.'
        />
        <AuthProvider>
          <SettingsProvider>
            <Navbar />
            <Outlet />
            {isValidRoute ? null : <FloatingActionButton />}
            {hideFooterRoutes ? <Copyright /> : <Footer />}
            <ReferralModal />
            <Toaster position='top-center' richColors />
            <React.Suspense fallback={null}>
              <TanStackRouterDevtools position='bottom-left' />
              <ReactQueryDevtools position='bottom' initialIsOpen={false} />
            </React.Suspense>
          </SettingsProvider>
        </AuthProvider>
      </HelmetProvider>
    </React.Fragment>
  )
}
