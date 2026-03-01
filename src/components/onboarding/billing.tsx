import { PricingCard, BillingPendingPage } from '@/components'

import { useQuery } from '@tanstack/react-query'
import { fetchPlans } from '@/integration'
import { FEATURES } from '@/lib'

type Props = {
  onSubscribe: (amount: number, plan: string) => void
}

export default function Billing({ onSubscribe }: Props) {
  const { data: plans, isLoading } = useQuery(fetchPlans)

  if (isLoading)
    return (
      <div className='max-w-md mx-auto w-full'>
        <BillingPendingPage />
      </div>
    )

  return (
    <div className='max-w-md mx-auto w-full'>
      <header className='mb-8'>
        <h1 className='text-3xl font-extrabold'>Billing</h1>
        <p className='text-sm text-muted-foreground mt-2'>
          Choose a plan that fits you.
        </p>
      </header>

      <div className='flex justify-center gap-6 flex-wrap'>
        {plans?.map((plan) => (
          <PricingCard
            title={plan.name}
            price={plan.amount}
            currency={plan.currency}
            frequency={plan.interval}
            description={plan.description}
            features={FEATURES}
            badge={plan.interval}
            ctaLabel='Start'
            onCta={() => onSubscribe(plan.amount, plan.planCode)}
          />
        ))}
      </div>
    </div>
  )
}
