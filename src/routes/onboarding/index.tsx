import { createFileRoute, redirect } from '@tanstack/react-router'
import { AnimatePresence } from 'motion/react'
import {
  Button,
  Challenges,
  ContentType,
  Goals,
  OnboardingReadingTest,
  QuickDrill,
  Progress,
  NotificationSetup,
  OnboardingPending,
} from '@/components'
import { Card } from '@/components/ui/card'

import { useOnboardingFlow, useOnboardingStore } from '@/store'

import Billing from '@/components/onboarding/billing'
import type { Preferences } from '@/types'
import {
  fetchChallenges,
  fetchContentType,
  fetchGoals,
} from '@/integration/queries'
import { useMutation, useQuery } from '@tanstack/react-query'
import { userMutation } from '@/integration'
import { toast } from 'sonner'
import { useSubscription } from '@/hooks'

export const Route = createFileRoute('/onboarding/')({
  component: RouteComponent,
  pendingComponent: OnboardingPending,
  beforeLoad: ({ context }) => {
    const { user, session } = context
    if (!session) throw redirect({ to: '/auth' })
    if (!user) return context
    if (user?.onboarding_completed && user.is_subscribed)
      throw redirect({ to: '/dashboard/practice' })
  },
  loader: ({ context: { session } }) => {
    if (!session) return
    const user_metadata = session?.user.user_metadata
    const name = user_metadata.displayName || user_metadata.full_name
    const email = session?.user.email
    useOnboardingStore.setState({ email, name })
  },
})

function RouteComponent() {
  const { updateProfile, ...onboarding } = useOnboardingStore()
  const { current_step, total_steps, update } = useOnboardingFlow()
  const progress = ((current_step + 1) / total_steps) * 100

  const { data: goals } = useQuery(fetchGoals)
  const { data: challenges } = useQuery(fetchChallenges)
  const { data: contentType } = useQuery(fetchContentType)

  const { mutateAsync: createMutateAsync, isPending } =
    useMutation(userMutation)

  const toggleSelection = (category: keyof Preferences, value: string) => {
    updateProfile({
      [category]: onboarding[category].includes(value)
        ? onboarding[category].filter((item) => item !== value)
        : [...onboarding[category], value],
    })
  }

  const { onSubscribe } = useSubscription()

  const handleSubmission = async () => {
    createMutateAsync({
      ...onboarding,
      onboarding_completed: true,
      streak_days: 1,
    })
      .then(() => {
        handleNext()
      })
      .catch((error) => toast.error(error.message))
  }

  const handleNext = () => {
    if (current_step < total_steps - 1) {
      update({ current_step: current_step + 1 })
    }
  }

  const canProceed = () => {
    switch (current_step) {
      case 0:
        return onboarding.challenges.length > 0
      case 1:
        return onboarding.content_type.length > 0
      case 2:
        return onboarding.goals.length > 0
      default:
        return false
    }
  }

  if (current_step === 3) return <OnboardingReadingTest />
  if (current_step === 4) return <QuickDrill />
  if (current_step === 5)
    return (
      <NotificationSetup isLoading={isPending} onContinue={handleSubmission} />
    )
  if (current_step === 6) return <Billing onSubscribe={onSubscribe} />

  return (
    <Card className=' bg-transparent border-0 shadow-none w-full max-w-3xl mx-auto md:mt-20 md:bg-card md:shadow-lg md:p-8 '>
      {/* Progress Bar */}
      <div className='md:mb-8 mb-4'>
        <div className='flex justify-between mb-2 text-sm text-muted-foreground'>
          <span>
            Step {current_step + 1} of {total_steps}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Welcome Message */}
      {current_step === 0 && (
        <div className='mb-4 text-center'>
          <h2 className='mb-1 font-extralight text-2xl'>
            Welcome, {onboarding.name}! 👋
          </h2>
          <p className='text-muted-foreground text-sm'>
            Let's personalize your learning journey
          </p>
        </div>
      )}

      {/* Steps */}
      <AnimatePresence mode='wait'>
        {current_step === 0 && (
          <Challenges
            challenges={challenges || []}
            selections={onboarding.challenges}
            toggleSelection={toggleSelection}
          />
        )}
        {current_step === 1 && (
          <ContentType
            contentType={contentType || []}
            selections={onboarding.content_type}
            toggleSelection={toggleSelection}
          />
        )}
        {current_step === 2 && (
          <Goals
            goals={goals || []}
            selections={onboarding.goals}
            toggleSelection={toggleSelection}
          />
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className='w-full fixed bottom-0 left-0 right-0 z-50 md:relative md:bottom-auto md:left-auto md:right-auto bg-gradient-to-t from-background/50 via-background/5 to-transparent backdrop-blur-sm'>
        <div className='py-4 px-4 pt-6 md:p-0'>
          <Button
            size={'xl'}
            onClick={handleNext}
            disabled={!canProceed()}
            className='w-full'>
            {current_step === total_steps - 1 ? 'Complete' : 'Next'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
