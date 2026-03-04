import { Link, useLocation } from '@tanstack/react-router'
import { BookOpen } from 'lucide-react'
import { motion } from 'motion/react'

import { Button, ProfileMenu } from './ui'
import { useAuth } from '@/context/auth-provider'
import { cn } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'

const AnimateLink = motion.create(Link)

const Navbar = () => {
  const { session, isLoading } = useAuth()
  const pathname = useLocation().pathname
  const isDashboard = pathname.includes('/dashboard')

  if (isDashboard) {
    const tabs = [
      { id: 'practice', label: 'Practice', icon: TrendingUp },
      { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    ]

    const activeTab =
      tabs.find((tab) => {
        if (tab.id === 'dashboard') {
          return pathname === '/dashboard' || pathname === '/dashboard/'
        }
        return pathname.includes(`/dashboard/${tab.id}`)
      })?.id || 'dashboard'

    return (
      <nav className='w-full bg-background/80 backdrop-blur-md border-b py-3 px-4 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto flex items-center justify-between'>
          <AnimateLink
            whileHover={{ scale: 1.05 }}
            to='/'
            className='text-lg font-bold text-primary dark:text-primary-foreground flex gap-1 items-center'>
            <BookOpen className='size-6' />
            <span className='hidden sm:inline'>Clariolane</span>
          </AnimateLink>

          {/* Center Tabs */}
          <div className='flex items-center justify-center absolute left-1/2 transform -translate-x-1/2'>
            <div className='flex items-center p-1 bg-muted/50 border border-border/40 rounded-full backdrop-blur-sm'>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                const Icon = tab.icon

                return (
                  <Link
                    key={tab.id}
                    // @ts-ignore
                    to={
                      tab.id === 'dashboard'
                        ? '/dashboard'
                        : `/dashboard/${tab.id}`
                    }
                    className={cn(
                      'relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground',
                    )}>
                    {isActive && (
                      <motion.div
                        layoutId='active-dashboard-tab-nav'
                        className='absolute inset-0 bg-background rounded-full shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                        transition={{
                          type: 'spring',
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <span className='relative z-10 flex items-center gap-2'>
                      <Icon className='w-4 h-4' />
                      {tab.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className='flex gap-4 items-center font-semibold'>
            {isLoading ? (
              <div className='w-24 h-10 rounded-full bg-muted animate-pulse' />
            ) : !session ? (
              <Button asChild>
                <AnimateLink to='/auth'>Sign in</AnimateLink>
              </Button>
            ) : (
              <ProfileMenu />
            )}
          </div>
        </div>
      </nav>
    )
  }

  // Floating pill navbar for landing page
  return (
    <nav className='fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none '>
      <div className='bg-white/90 dark:bg-purple-950/80 backdrop-blur-xl border border-white/20 dark:border-purple-800/50 shadow-lg shadow-purple-500/10 rounded-full px-6 py-3 w-full max-w-6xl flex items-center justify-between pointer-events-auto'>
        {/* Logo */}
        <AnimateLink
          whileHover={{ scale: 1.05 }}
          to='/'
          className='text-lg font-bold text-gray-900 dark:text-white flex gap-2 items-center'>
          <div className='bg-purple-600 rounded-full p-1 text-white'>
            <BookOpen className='size-4' />
          </div>
          Clariolane
        </AnimateLink>

        {/* Center Links - Hidden on mobile, visible on md+ */}
        {/* <div className='hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground'>
          <a
            href='#how-it-works'
            className='hover:text-purple-600 transition-colors'>
            How it works
          </a>
          <a
            href='#pricing'
            className='hover:text-purple-600 transition-colors'>
            Pricing
          </a>
          <a
            href='#library'
            className='hover:text-purple-600 transition-colors'>
            Library
          </a>
        </div> */}

        {/* Right Action */}
        <div className='flex gap-4 items-center font-semibold'>
          {isLoading ? (
            <div className='w-24 h-10 rounded-full bg-muted/50 dark:bg-purple-900/50 animate-pulse' />
          ) : !session ? (
            <Button
              asChild
              className='rounded-full bg-purple-600 hover:bg-purple-700 text-white px-6 h-10 shadow-md shadow-purple-500/20'>
              <AnimateLink to='/auth'>Login</AnimateLink>
            </Button>
          ) : (
            <ProfileMenu />
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
