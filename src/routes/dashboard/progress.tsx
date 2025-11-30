import { createFileRoute } from '@tanstack/react-router'
import {
  StatsOverview,
  ProgressCharts,
  ActivityChart,
  AchievementsCard,
  MilestonesCard,
} from '@/components/dashboard/progress'
import { getBadges } from '@/lib'

import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { supabaseService } from '~supabase/clientServices'
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
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['user_profile'],
    queryFn: () => supabaseService.getUser(),
  })

  const { data: sessions } = useQuery({
    queryKey: ['practice_sessions', userProfile?.id],
    queryFn: () => supabaseService.getPracticedSessions(userProfile?.id, 100),
    enabled: !!userProfile?.id,
  })

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
          daySessions.reduce((acc, s) => acc + s.wpm, 0) / daySessions.length
        )
      : null

    const avgComp = daySessions.length
      ? Math.round(
          daySessions.reduce((acc, s) => acc + s.comprehension, 0) /
            daySessions.length
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
        isWithinInterval(new Date(s.created_at!), { start, end })
      ) || []

    const avgWPM = weekSessions.length
      ? Math.round(
          weekSessions.reduce((acc, s) => acc + s.wpm, 0) / weekSessions.length
        )
      : 0

    return {
      week: i === 3 ? 'This Week' : `Week ${i + 1}`,
      sessions: weekSessions.length,
      avgWPM,
    }
  })

  const badges = getBadges(userProfile, sessions)

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
      {/* Stats Overview */}
      <StatsOverview userProfile={userProfile} badges={badges} />

      {/* Charts */}
      <ProgressCharts weeklyProgress={weeklyProgress} />

      {/* Session Activity */}
      <ActivityChart sessionData={sessionData} />

      <div className='grid md:grid-cols-2 gap-6'>
        {/* Badges */}
        <AchievementsCard badges={badges} />

        {/* Milestones */}
        <MilestonesCard milestones={milestones} />
      </div>
    </motion.div>
  )
}
