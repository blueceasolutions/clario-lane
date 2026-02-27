import Billing from '@/components/onboarding/billing'
import { SeoHead } from '@/components/shared'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { BillingPendingPage } from '@/components'
import { useSubscription } from '@/hooks'

export const Route = createFileRoute('/pricing')({
  component: RouteComponent,
  pendingComponent: BillingPendingPage,
  loader: async ({ context }) => {
    const { user } = context
    if (user?.is_subscribed) {
      throw redirect({ to: '/dashboard' })
    }
  },
})

function RouteComponent() {
  const { onSubscribe } = useSubscription()

  return (
    <div className='py-10 px-4 pt-28 nd:pt-24'>
      <SeoHead
        title='Pricing'
        description='Choose the plan that fits your needs.'
      />
      <Billing onSubscribe={onSubscribe} />
    </div>
  )
}
