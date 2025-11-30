import {
  BackButton,
  Tabs,
  TabsList,
  TabsTrigger,
  Copyright,
} from '@/components'
import { useOnboardingFlow } from '@/store'
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

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const { session, user } = context

    if (!session) {
      throw redirect({ to: '/auth' })
    }

    if (!user || !user?.onboarding_completed)
      throw redirect({ to: '/onboarding' })

    if (!user?.is_subscribed) {
      useOnboardingFlow.setState({ current_step: 7 })
      throw redirect({ to: '/onboarding' })
    }
  },
})

const dashboardPrimaryPaths = [
  'dashboard',
  'practice',
  'progress',
  'challenges',
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
          <BackButton />
          <Tabs value={activePathname} className='w-fit mx-auto '>
            <TabsList className={`grid w-full max-w-2xl mx-auto grid-cols-4`}>
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
      <Copyright />
    </div>
  )
}
