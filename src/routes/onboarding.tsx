import { Button } from '@/components'
import { SeoHead } from '@/components/shared'

import { useOnboardingFlow } from '@/store'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { OnboardingPending } from '@/components'
import { useQuery } from '@tanstack/react-query'
import { fetchUserProfile } from '@/integration'
import { useEffect } from 'react'

export const Route = createFileRoute('/onboarding')({
  component: RouteComponent,
  pendingComponent: OnboardingPending,
})

function RouteComponent() {
  const { current_step, total_steps, update } = useOnboardingFlow()

  const onSkipNextStep = () => {
    if (current_step <= 5) update({ current_step: current_step + 1 })
  }

  const { data: user } = useQuery(fetchUserProfile)

  useEffect(() => {
    if (user) {
      if (user?.onboarding_completed && !user.is_subscribed) {
        update({ current_step: 6 })
      }
    }
  }, [user])

  const canSkip = [4].includes(current_step)

  return (
    <div className='min-h-[80svh] p-4 max-w-6xl mx-auto '>
      <SeoHead title='Onboarding' description='Get started with Clariolane.' />
      {/* Progress Bar */}
      <div className=' pt-24'>
        <div className='mb-4'>
          <div className='flex justify-between mb-2 text-sm text-muted-foreground'>
            <div className='flex gap-2 items-center'>
              {current_step > 0 ? (
                <Button
                  size={'sm'}
                  variant='ghost'
                  onClick={() => update({ current_step: current_step - 1 })}>
                  <ArrowLeft />
                  Back
                </Button>
              ) : null}
              {canSkip ? (
                <Button
                  size='sm'
                  variant={'ghost'}
                  onClick={onSkipNextStep}
                  className='flex items-center gap-2'>
                  Skip <ArrowRight />
                </Button>
              ) : null}
            </div>
            <div className='flex gap-2 items-center'>
              <span>
                Step {current_step + 1} of {total_steps}
              </span>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-center mb-24 md:mb-auto'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
