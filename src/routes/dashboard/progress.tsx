import { createFileRoute } from '@tanstack/react-router'
import {
  StatsOverview,
  ProgressCharts,
  ActivityChart,
  MilestonesCard,
} from '@/components/dashboard/progress'
import { SeoHead } from '@/components/shared'
import { AchievementsGrid } from '@/components/gamification'
import { useGamification } from '@/hooks'

import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { fetchPracticeSessions, fetchUserProfile } from '@/integration/queries'
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isWithinInterval,
} from 'date-fns'

export const Route = createFileRoute('/dashboard/progress')({
  component: RouteComponent,
})

export function RouteComponent() {
  const { data: userProfile, isLoading } = useQuery(fetchUserProfile)

  const { data: sessions } = useQuery(
    fetchPracticeSessions(userProfile?.id, 100),
  )

  const { isLoading: isLoadingGamification } = useGamification()

  if (isLoading || !userProfile) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    )
  }

  // Transform sessions for Weekly Progress Chart (Last 7 days)
  const weeklyProgress = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i)
    const daySessions =
      sessions?.filter((s) => isSameDay(new Date(s.created_at!), date)) || []

    // Calculate average for the day
    const avgWpm = daySessions.length
      ? Math.round(
          daySessions.reduce((acc, s) => acc + s.wpm, 0) / daySessions.length,
        )
      : null

    const avgComp = daySessions.length
      ? Math.round(
          daySessions.reduce((acc, s) => acc + s.comprehension, 0) /
            daySessions.length,
        )
      : null

    return {
      day: format(date, 'EEE'),
      wpm: avgWpm,
      comprehension: avgComp,
      fullDate: date,
    }
  })

  // Transform for Session Activity (Last 4 weeks)
  const sessionData = Array.from({ length: 4 }).map((_, i) => {
    const date = subDays(new Date(), (3 - i) * 7)
    const start = startOfWeek(date)
    const end = endOfWeek(date)

    const weekSessions =
      sessions?.filter((s) =>
        isWithinInterval(new Date(s.created_at!), { start, end }),
      ) || []

    const avgWPM = weekSessions.length
      ? Math.round(
          weekSessions.reduce((acc, s) => acc + s.wpm, 0) / weekSessions.length,
        )
      : 0

    return {
      week: i === 3 ? 'This Week' : `Week ${i + 1}`,
      sessions: weekSessions.length,
      avgWPM,
    }
  })

  // const badges = getBadges(userProfile, sessions) // Removed as it's no longer used

  const milestones = [
    {
      id: 1,
      title: 'Completed Baseline Test',
      date: userProfile.created_at
        ? format(new Date(userProfile.created_at), 'MMM d, yyyy')
        : 'N/A',
      completed: !!userProfile.baseline_wpm,
    },
    {
      id: 2,
      title: 'First 100 XP Earned',
      date: (userProfile.xp_earned || 0) >= 100 ? 'Completed' : 'In Progress',
      completed: (userProfile.xp_earned || 0) >= 100,
    },
    {
      id: 3,
      title: '7-Day Streak',
      date: (userProfile.streak_days || 0) >= 7 ? 'Completed' : 'In Progress',
      completed: (userProfile.streak_days || 0) >= 7,
    },
    {
      id: 4,
      title: 'Reach 300 WPM',
      date: (userProfile.current_wpm || 0) >= 300 ? 'Completed' : 'In Progress',
      completed: (userProfile.current_wpm || 0) >= 300,
    },
    {
      id: 5,
      title: 'Complete 30 Sessions',
      date:
        (userProfile.total_sessions || 0) >= 30 ? 'Completed' : 'In Progress',
      completed: (userProfile.total_sessions || 0) >= 30,
    },
  ]

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -40, opacity: 0 }}
      transition={{ type: 'spring' }}
      className='space-y-6'>
      <SeoHead
        title='Progress & Stats'
        description='Detailed analytics of your reading speed and comprehension improvements.'
      />
      {/* Stats Overview */}
      <StatsOverview userProfile={userProfile} />

      {/* Charts */}
      <ProgressCharts weeklyProgress={weeklyProgress} />

      {/* Session Activity */}
      <ActivityChart sessionData={sessionData} />

      <div className='grid md:grid-cols-2 gap-6'>
        {/* Badges/Achievements */}
        {!isLoadingGamification ? (
          <AchievementsGrid />
        ) : (
          <div className='h-[300px] flex items-center justify-center border rounded-lg bg-gray-50 dark:bg-zinc-900/50 dark:border-zinc-800'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        )}

        {/* Milestones */}
        <MilestonesCard milestones={milestones} />
      </div>
    </motion.div>
  )
}
