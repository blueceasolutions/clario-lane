import { BackButton, Tabs, TabsList, TabsTrigger } from '@/components'

import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
} from '@tanstack/react-router'
import { BookOpen, Target, TrendingUp, Trophy } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { useEffect, useState } from 'react'
import { VictoryModal, LevelUpModal } from '@/components/gamification'
import { useGamificationStore } from '@/store/gamification/useGamificationStore'
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

const dashboardPrimaryPaths = [
  'practice',
  'dashboard',
  'progress',
  // 'challenges',
]

const PrimaryPaths = [...dashboardPrimaryPaths] as const

const Icons = {
  [PrimaryPaths[0]]: TrendingUp,
  [PrimaryPaths[1]]: BookOpen,
  [PrimaryPaths[2]]: Target,
  [PrimaryPaths[3]]: Trophy,
}

function RouteComponent() {
  const pathsArray = useLocation().pathname.split('/')
  const currentPath = pathsArray[pathsArray.length - 1]

  const [activePathname, setActivePathname] = useState(currentPath)

  const { victoryModal, levelUpModal, closeVictoryModal, closeLevelUpModal } =
    useGamificationStore()

  useEffect(() => {
    setActivePathname(currentPath)
    if (dashboardPrimaryPaths.includes(currentPath)) {
      setActivePathname(currentPath)
    } else {
      let newPath = ''
      dashboardPrimaryPaths.forEach((path) => {
        if (pathsArray.includes(path)) newPath = path
      })
      setActivePathname(newPath)
    }
  }, [activePathname, currentPath, pathsArray])

  return (
    <div className='min-h-[calc(100vh-6rem)] w-full flex flex-col'>
      <div className='max-w-7xl flex-1 w-full mx-auto px-6 py-8'>
        <div className='flex items-center pb-8'>
          <div className='w-fit md:w-[100px]'>
            <BackButton />
          </div>
          <Tabs value={activePathname} className='w-fit mx-auto '>
            <TabsList className={`grid w-full max-w-2xl mx-auto grid-cols-3`}>
              {dashboardPrimaryPaths.map((path) => {
                const Icon = Icons[path]
                return (
                  <TabsTrigger
                    key={path}
                    asChild
                    value={path}
                    className='flex items-center gap-2'>
                    <Link
                      to={
                        '/dashboard' + (path === 'dashboard' ? '' : `/${path}`)
                      }>
                      <Icon className='w-4 h-4' />
                      <span className='hidden sm:inline capitalize'>
                        {path}
                      </span>
                    </Link>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </div>
        <AnimatePresence mode='wait'>
          <Outlet />
        </AnimatePresence>
      </div>
      {/* <Copyright /> */}

      {/* Global Gamification Modals */}
      {victoryModal.data && (
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
      />
    </div>
  )
}
