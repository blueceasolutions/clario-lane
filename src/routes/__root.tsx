import * as React from 'react'
import {
  Outlet,
  createRootRouteWithContext,
  useLocation,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { QueryClient } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import Navbar from '@/components/navbar'
import { AuthProvider } from '@/context/auth-provider'
import { HelmetProvider } from 'react-helmet-async'
import { SeoHead } from '@/components/shared'

import {
  Footer,
  SettingsProvider,
  FloatingActionButton,
  RootPending,
  Copyright,
  ReferralModal,
} from '@/components'
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
    return { ...context, session, user }
  },
})

// Create a persister
// const persister = createSyncStoragePersister({
//   storage: window.localStorage,
// })

import { clientEnv } from '@/config/env'
import { useEffect } from 'react'
import ReactGA from 'react-ga4'

import { REF_KEYWORD } from '@/lib/constants'

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
            <TanStackRouterDevtools position='bottom-left' />
            <ReactQueryDevtools position='bottom' initialIsOpen={false} />
          </SettingsProvider>
        </AuthProvider>
      </HelmetProvider>
    </React.Fragment>
  )
}
