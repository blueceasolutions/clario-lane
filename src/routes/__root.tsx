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

import {
  Footer,
  PendingPage,
  SettingsProvider,
  FloatingActionButton,
} from '@/components'
import type { Session } from '@supabase/supabase-js'
import { supabaseService } from '~supabase/clientServices'
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

export const Route = createRootRouteWithContext<RootRouteContext>()({
  component: RootComponent,
  pendingComponent: PendingPage,
  beforeLoad: async ({ context }) => {
    const session = await supabaseService.getSession()
    const user = await supabaseService.getUser()
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

function RootComponent() {
  const location = useLocation()
  console.log(location.pathname)
  return (
    <React.Fragment>
      <SettingsProvider>
        <Navbar />
        <Outlet />
        <FloatingActionButton />
        {!location.pathname.startsWith('/dashboard') && <Footer />}
        <Toaster position='top-center' richColors />
        <TanStackRouterDevtools position='bottom-left' />
        <ReactQueryDevtools position='bottom' initialIsOpen={false} />
      </SettingsProvider>
    </React.Fragment>
  )
}
