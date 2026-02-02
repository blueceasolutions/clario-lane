import Billing from '@/components/onboarding/billing'
import { clientEnv } from '@/config/env'
import {
  createFileRoute,
  redirect,
  useRouteContext,
  useRouter,
} from '@tanstack/react-router'
import { useCallback, useEffect } from 'react'
import PaystackPop from '@paystack/inline-js'
import type { UserTable } from '@/types'
import { supabaseService } from '~supabase/clientServices'

const paystackPop = new PaystackPop()
export const Route = createFileRoute('/pricing')({
  component: RouteComponent,
  loader: async ({ context }) => {
    const { user } = context

    if (user?.is_subscribed) {
      throw redirect({ to: '/dashboard' })
    }
  },
})

function RouteComponent() {
  const user = useRouteContext({ from: '__root__' }).user
  const route = useRouter()

  const onSubscribe = useCallback(
    (amount: number, plan: string) => {
      paystackPop.newTransaction({
        key: clientEnv.VITE_PAYSTACK_PUBLIC_KEY,
        email: user?.email!,
        amount: amount * 100,
        planCode: plan,
      })
    },
    [user?.email],
  )

  useEffect(() => {
    const handleConfirmSubscription = (payload: UserTable) => {
      if (payload.email === user?.email && payload.is_subscribed) {
        route.navigate({ to: '/dashboard' })
      }
    }
    const channel = supabaseService.channel(handleConfirmSubscription)
    return () => {
      supabaseService.sp.removeChannel(channel)
    }
  }, [user?.email])

  return (
    <div className='py-10 px-4 pt-28 nd:pt-24'>
      <Billing onSubscribe={onSubscribe} />
    </div>
  )
}
