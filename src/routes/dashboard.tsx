import { DashboardTabs } from '@/components'

import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AnimatePresence } from 'motion/react'
import { fetchNextSubscriptionDate } from '@/integration'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const { session, user, queryClient } = context

    if (!session) {
      throw redirect({ to: '/auth' })
    }

    if (!user || !user?.onboarding_completed)
      throw redirect({ to: '/onboarding' })

    if (user.is_subscribed) return

    const response = await queryClient.fetchQuery(fetchNextSubscriptionDate)

    const nextSubscriptionDate = new Date(response)
    const currentDate = new Date()
    const isSubscriptionExpired = nextSubscriptionDate < currentDate
    if (isSubscriptionExpired) {
      throw redirect({ to: '/pricing' })
    }
  },
})

function RouteComponent() {
  // const { victoryModal, levelUpModal, closeVictoryModal, closeLevelUpModal } =
  //   useGamificationStore()

  return (
    <div className='min-h-[calc(80vh-6rem)] w-full flex flex-col'>
      <div className='max-w-7xl flex-1 w-full mx-auto px-6 py-8'>
        <div className='flex items-center pb-8'>
          {/* <div className='w-fit md:w-[100px]'>
            <BackButton />
          </div> */}
          <DashboardTabs />
        </div>
        <AnimatePresence mode='wait'>
          <Outlet />
        </AnimatePresence>
      </div>
      {/* <Copyright /> */}

      {/* Global Gamification Modals */}
      {/* {victoryModal.data && (
        <VictoryModal
          isOpen={victoryModal.isOpen}
          onClose={closeVictoryModal}
          {...victoryModal.data}
        />
      )}
      <LevelUpModal
        isOpen={levelUpModal.isOpen}
        onClose={closeLevelUpModal}
        newLevel={levelUpModal.newLevel}
      /> */}
    </div>
  )
}
