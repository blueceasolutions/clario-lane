import { Link, useLocation } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { BookOpen, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'practice', label: 'Practice', icon: TrendingUp },
  { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
  // { id: 'progress', label: 'Progress', icon: Target },
]

export const DashboardTabs = () => {
  const pathname = useLocation().pathname

  const activeTab =
    tabs.find((tab) => {
      if (tab.id === 'dashboard') {
        return pathname === '/dashboard' || pathname === '/dashboard/'
      }
      return pathname.includes(`/dashboard/${tab.id}`)
    })?.id || 'dashboard'

  return (
    <div className='flex items-center  justify-center w-full'>
      <div className='flex items-center p-1.5 bg-muted/40 border border-border/40 rounded-full backdrop-blur-sm'>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon

          return (
            <Link
              key={tab.id}
              // @ts-ignore
              to={
                tab.id === 'dashboard' ? '/dashboard' : `/dashboard/${tab.id}`
              }
              className={cn(
                'relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}>
              {isActive && (
                <motion.div
                  layoutId='active-dashboard-tab'
                  className='absolute inset-0 bg-background rounded-full shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                  transition={{
                    type: 'spring',
                    bounce: 0.2,
                    duration: 0.6,
                  }}
                />
              )}
              <Icon className='w-4 h-4 relative z-10' />
              <span className='relative z-10'>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
