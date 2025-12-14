import { useState } from 'react'
import PricingCard from '@/components/pricingCard'
import { Switch } from '..'

import type { PlanObject } from '@/types'

const features = [
  'Unlimited speed reading exercises',
  'Personalized AI coaching',
  'Detailed progress analytics',
  'Daily reading goals & reminders',
  'Access to advanced RSVP training',
  'Focus building exercises',
]

type Props = {
  plans: PlanObject[]
  onSubscribe: (amount: number, plan: string) => void
}

export default function Billing({ plans, onSubscribe }: Props) {
  const [interval, setInterval] = useState<'mo' | 'yr'>('mo')

  return (
    <div className='max-w-md mx-auto w-full'>
      <header className='mb-8'>
        <h1 className='text-3xl font-extrabold'>Billing</h1>
        <p className='text-sm text-muted-foreground mt-2'>
          Choose a plan that fits you.
        </p>
      </header>

      <div className=' hidden items-center gap-2 mb-6'>
        <span className={interval === 'mo' ? `font-bold text-primary` : ''}>
          Monthly
        </span>
        <Switch
          checked={interval === 'yr'}
          onCheckedChange={(checked) => setInterval(checked ? 'yr' : 'mo')}
        />
        <span className={interval === 'yr' ? `font-bold text-primary` : ''}>
          Yearly
        </span>

        <div className='ml-auto text-sm text-muted-foreground'>
          Billed {interval === 'mo' ? 'monthly' : 'annually'}
        </div>
      </div>

      <div className='flex justify-center gap-6 flex-wrap'>
        {plans.map((plan) => (
          <PricingCard
            title={plan.name}
            price={plan.amount}
            currency={plan.currency}
            frequency={plan.interval}
            description={plan.description}
            features={features}
            badge={plan.interval}
            ctaLabel='Start'
            onCta={() => onSubscribe(plan.amount, plan.planCode)}
          />
        ))}
      </div>
    </div>
  )
}
