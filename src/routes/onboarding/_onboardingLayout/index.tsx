import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { AnimatePresence } from 'motion/react'
import {
  Button,
  Challenges,
  ContentType,
  Goals,
  OnboardingReadingTest,
  QuickDrill,
  Progress,
  PendingPage,
  NotificationSetup,
} from '@/components'
import { Card } from '@/components/ui/card'
import PaystackPop from '@paystack/inline-js'

import { useOnboardingFlow, useOnboardingStore } from '@/store'

import Billing from '@/components/onboarding/billing'
import type { Preferences, UserTable } from '@/types'
import {
  fetchChallenges,
  fetchContentType,
  fetchGoals,
  fetchPlans,
} from '@/integration/queries'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useCreateUserMutation, useInitSubscription } from '@/integration'
import { useCallback, useEffect, useState } from 'react'
import { supabaseService } from '~supabase/clientServices'

export const Route = createFileRoute('/onboarding/_onboardingLayout/')({
  component: RouteComponent,
  pendingComponent: PendingPage,
  beforeLoad: ({ context }) => {
    const { user, session } = context
    if (!session) throw redirect({ to: '/auth' })
    if (!user) return context
    if (user?.onboarding_completed && user.is_subscribed)
      throw redirect({ to: '/dashboard' })
  },
  loader: ({ context: { session } }) => {
    if (!session) return
    const user_metadata = session?.user.user_metadata
    const name = user_metadata.displayName || user_metadata.full_name
    const email = session?.user.email
    useOnboardingStore.setState({ email, name })
  },
})

const paystackPop = new PaystackPop()

function RouteComponent() {
  const { updateProfile, ...onboarding } = useOnboardingStore()
  const { current_step, total_steps, update } = useOnboardingFlow()
  const progress = ((current_step + 1) / total_steps) * 100

  const { data: goals } = useQuery(fetchGoals)
  const { data: challenges } = useQuery(fetchChallenges)
  const { data: contentType } = useQuery(fetchContentType)
  const { data: plans } = useQuery(fetchPlans)
  const [user, setUser] = useState<UserTable>()

  const { mutateAsync: createMutateAsync } = useMutation(useCreateUserMutation)

  const { mutateAsync: subscriptionMutate } = useMutation(useInitSubscription)

  const toggleSelection = (category: keyof Preferences, value: string) => {
    updateProfile({
      [category]: onboarding[category].includes(value)
        ? onboarding[category].filter((item) => item !== value)
        : [...onboarding[category], value],
    })
  }

  const onSubscribe = useCallback(
    (amount: number, plan: string) => {
      subscriptionMutate({
        email: onboarding.email,
        amount,
        plan,
      }).then((data) => paystackPop.resumeTransaction(data.data.access_code))
    },
    [onboarding.email, subscriptionMutate]
  )

  const handleSubmission = async () => {
    createMutateAsync({
      ...onboarding,
      onboarding_completed: true,
      streak_days: 1,
    }).then(() => handleNext())
  }

  const handleNext = () => {
    if (current_step < total_steps - 1) {
      update({ current_step: current_step + 1 })
    }
  }
  const route = useRouter()

  const handleConfirmSubscription = useCallback(
    ({ email }: UserTable) => {
      if (email === onboarding.email) {
        supabaseService.getUser().then((res) => setUser(res))
      }
    },
    [onboarding.email]
  )

  useEffect(() => {
    if (user?.is_subscribed) {
      update({ current_step: 0 })
      route.navigate({ to: '/dashboard' })
    }
  }, [route, update, user?.is_subscribed])

  useEffect(() => {
    const channel = supabaseService.channel(handleConfirmSubscription)
    return () => {
      supabaseService.supabase.removeChannel(channel)
    }
  }, [handleConfirmSubscription])

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
    return <NotificationSetup onContinue={handleSubmission} />
  if (current_step === 6)
    return <Billing plans={plans || []} onSubscribe={onSubscribe} />

  return (
    <Card className='w-full mx-auto mt-10 lg:mt-20 max-w-3xl  p-8'>
      {/* Progress Bar */}
      <div className='mb-8'>
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
        <div className='mb-6 text-center'>
          <h2 className='mb-2'>Welcome, {onboarding.name}! 👋</h2>
          <p className='text-muted-foreground'>
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
      <div className='flex gap-4 mt-8'>
        <Button
          size={'lg'}
          onClick={handleNext}
          disabled={!canProceed()}
          className='flex-1'>
          {current_step === total_steps - 1 ? 'Complete' : 'Next'}
        </Button>
      </div>
    </Card>
  )
}
