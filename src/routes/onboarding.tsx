import { Button } from '@/components'

import { useOnboardingFlow } from '@/store'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { supabaseService } from '~supabase/clientServices'

export const Route = createFileRoute('/onboarding')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = await supabaseService.getUser()
    return { ...context, user }
  },
})

function RouteComponent() {
  const { current_step, total_steps, update } = useOnboardingFlow()

  const onSkipNextStep = () => {
    if (current_step < 6) update({ current_step: current_step + 1 })
  }

  const canSkip = [4, 5].includes(current_step)

  return (
    <div className='min-h-[80svh] bg-background p-4 max-w-6xl mx-auto'>
      {/* Progress Bar */}
      <div className='mb-8'>
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

      <div className='flex items-center justify-center '>
        <Outlet />
      </div>
    </div>
  )
}
