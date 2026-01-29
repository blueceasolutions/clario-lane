import {
  OverviewStats,
  ProgressChart,
  GoalTrackerCard,
  OverviewPending,
  DailyGoalRing,
  StreakCounter,
  QuestCard,
  Button,
} from '@/components'
import { useQuery } from '@tanstack/react-query'
import { useClaimQuest, useGamification } from '@/hooks'

import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { supabaseService } from '~supabase/clientServices'

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
  pendingComponent: OverviewPending,
})

export function RouteComponent() {
  const { data: userProfile } = useQuery({
    queryKey: ['user_profile'],
    queryFn: () => supabaseService.getUser(),
  })
  const { data } = useQuery({
    queryKey: ['progress_data'],
    queryFn: async () =>
      await supabaseService.getPracticedSessions(userProfile?.id),
  })

  const {
    stats,
    achievements,
    quests,
    isLoading: isLoadingGamification,
  } = useGamification()

  if (!userProfile) {
    throw redirect({ to: '/auth' })
  }

  const { claimQuest } = useClaimQuest()

  const readingSpeedData = data?.length
    ? data?.map((practiced_session, index) => ({
        session: `session ${index + 1}`,
        wpm: practiced_session.wpm,
        comprehension: practiced_session.comprehension,
      }))
    : []

  const goalWPM = Math.round(userProfile.baseline_wpm! * 1.5)
  const progressPercent = Math.round(
    ((userProfile.current_wpm! - userProfile.baseline_wpm!) /
      (goalWPM - userProfile.baseline_wpm!)) *
      100,
  )
  const improvement = userProfile.current_wpm! - userProfile.baseline_wpm!

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -40, opacity: 0 }}
      transition={{ type: 'spring' }}
      className='space-y-4'
      key='overview'>
      {/* Quick Stats */}
      <OverviewStats
        comprehension={{
          score: userProfile.current_comprehension_score!,
          baseline: userProfile.baseline_comprehension!,
        }}
        currentSpeed={{
          wpm: userProfile.current_wpm!,
          baseline: userProfile.baseline_wpm!,
          improvement,
        }}
        progress={null}
        session={{
          streak: stats?.current_streak || 0,
          total: userProfile.total_sessions || 0,
        }}
      />

      {/* Gamification Widgets */}
      {!isLoadingGamification && stats && (
        <div className='grid md:grid-cols-2 gap-4'>
          {/* <LevelProgressBar currentXP={stats.xp} level={stats.level} /> */}
          <StreakCounter
            currentStreak={stats.current_streak}
            longestStreak={stats.longest_streak}
          />
          <DailyGoalRing />
        </div>
      )}
      <div className='flex justify-center items-center bg-linear-to-r from-primary/10 to-secondary/10 rounded-md py-12'>
        <Button size={'xl'} asChild>
          <Link to='/dashboard/practice'>Start Practicing</Link>
        </Button>
      </div>
      {/* Progress Chart */}
      <ProgressChart
        title='Reading speed'
        xDataKey='wpm'
        yDataKey='session'
        progressData={readingSpeedData}
      />

      <div className='grid md:grid-cols-2 gap-6'>
        {/* Today's Tasks */}
        {quests ? (
          <QuestCard
            todaysTasks={quests}
            onClaimQuest={(questId) => claimQuest(questId)}
          />
        ) : null}

        {/* Goal Tracker */}
        <GoalTrackerCard
          current_wpm={userProfile.current_wpm || 0}
          goalWPM={goalWPM}
          progressPercent={progressPercent}
          earnedBadges={achievements.unlocked?.length || 0}
          baseline_wpm={userProfile.baseline_wpm || 0}
          level={stats?.level}
          streak_days={stats?.current_streak}
          total_sessions={userProfile.total_sessions || 0}
        />
      </div>
    </motion.div>
  )
}
