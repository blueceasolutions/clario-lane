import Billing from '@/components/onboarding/billing'
import { clientEnv } from '@/config/env'
import { fetchPlans } from '@/integration'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useCallback, useEffect, useEffectEvent, useState } from 'react'
import PaystackPop from '@paystack/inline-js'
import { PendingPage } from '@/components'
import type { UserTable } from '@/types'
import { supabaseService } from '~supabase/clientServices'

const paystackPop = new PaystackPop()
export const Route = createFileRoute('/pricing')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: plans, isLoading } = useQuery(fetchPlans)
  const [user, setUser] = useState<UserTable | undefined>()
  const route = useRouter()

  const onSubscribe = useCallback(
    (amount: number, plan: string) => {
      paystackPop
        .newTransaction({
          key: clientEnv.VITE_PAYSTACK_PUBLIC_KEY,
          email: user?.email!,
          amount: amount * 100,
          planCode: plan,
        })
        .getStatus()
    },
    [user?.email]
  )

  const fetchUser = useEffectEvent(async () => await supabaseService.getUser())

  useEffect(() => {
    fetchUser().then((res) => {
      setUser(res)
    })
  }, [])

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
    <div className='py-10 px-4'>
      {isLoading ? (
        <PendingPage />
      ) : (
        <Billing plans={plans || []} onSubscribe={onSubscribe} />
      )}
    </div>
  )
}
