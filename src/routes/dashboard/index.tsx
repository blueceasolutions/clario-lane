import { lazy, Suspense } from 'react'
import {
  OverviewStats,
  GoalTrackerCard,
  OverviewPending,
  DailyGoalRing,
  StreakCounter,
  MAX_STREAK_FREEZES,
  STREAK_FREEZE_COST_XP,
  QuestCard,
  Button,
  Card,
  CardContent,
} from '@/components'
import { SeoHead } from '@/components/shared'
import { useQuery } from '@tanstack/react-query'
import { useBuyStreakFreeze, useClaimQuest, useGamification } from '@/hooks'
import { Trophy } from 'lucide-react'

import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { fetchPracticeSessions, fetchUserProfile } from '@/integration/queries'
import { getGoalBannerCopy } from '@/lib'

// recharts pulls a large vendor chunk in; only load it once this route
// actually renders instead of on every page's initial bundle.
const ProgressChart = lazy(() =>
  import('@/components/dashboard/overview/progress-chart').then((m) => ({
    default: m.ProgressChart,
  })),
)

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
  pendingComponent: OverviewPending,
})

function RouteComponent() {
  const { data: userProfile } = useQuery(fetchUserProfile)
  const { data } = useQuery(fetchPracticeSessions(userProfile?.id))

  const {
    stats,
    achievements,
    quests,
    isLoading: isLoadingGamification,
  } = useGamification(userProfile?.id)

  if (!userProfile) {
    throw redirect({ to: '/auth' })
  }

  const { claimQuest } = useClaimQuest(userProfile?.id)
  const { buyStreakFreeze, isBuyingStreakFreeze } = useBuyStreakFreeze(
    userProfile?.id,
  )

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
  const goalBannerCopy = getGoalBannerCopy(userProfile.goals)

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -40, opacity: 0 }}
      transition={{ type: 'spring' }}
      className='space-y-4'
      key='overview'>
      <SeoHead
        title='Overview'
        description='Your daily reading stats and gamification progress.'
      />
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
        <div className='grid md:grid-cols-3 gap-6'>
          <div className='md:col-span-2'>
            <StreakCounter
              currentStreak={stats.current_streak}
              streakFreezes={stats.streak_freezes}
              onBuyFreeze={buyStreakFreeze}
              canBuyFreeze={
                stats.streak_freezes < MAX_STREAK_FREEZES &&
                stats.xp >= STREAK_FREEZE_COST_XP
              }
              isBuyingFreeze={isBuyingStreakFreeze}
            />
          </div>
          <div className='md:col-span-1'>
            <DailyGoalRing userId={userProfile.id} />
          </div>
        </div>
      )}

      {/* Weekly Leaderboard teaser */}
      <Card>
        <CardContent className='p-5 flex items-center justify-between gap-4 flex-wrap'>
          <div className='flex items-center gap-3'>
            <Trophy className='w-5 h-5 text-amber-500 shrink-0' />
            <div>
              <p className='font-medium'>Weekly Leaderboard</p>
              <p className='text-sm text-muted-foreground'>
                See how you rank against other opted-in readers.
              </p>
            </div>
          </div>
          <Button variant='outline' asChild>
            <Link to='/dashboard/leaderboard'>View leaderboard</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Hero Banner */}
      <div className='relative overflow-hidden rounded-2xl bg-linear-to-r from-purple-600 to-indigo-600 p-8 text-white shadow-lg'>
        <div className='relative z-10 flex flex-col md:flex-row items-center justify-between gap-6'>
          <div className='space-y-2 text-center md:text-left'>
            <h2 className='text-3xl font-bold tracking-tight'>
              {goalBannerCopy.headline}
            </h2>
            <p className='text-purple-100 max-w-lg'>{goalBannerCopy.subtext}</p>
          </div>
          <Button
            size={'xl'}
            variant='secondary'
            className='shrink-0 font-semibold shadow-xl'
            asChild>
            <Link to='/dashboard/practice'>Start Practicing</Link>
          </Button>
        </div>

        {/* Decorative elements */}
        <div className='absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none' />
      </div>
      {/* Progress Chart */}
      <Suspense fallback={null}>
        <ProgressChart
          title='Reading speed'
          xDataKey='wpm'
          yDataKey='session'
          progressData={readingSpeedData}
        />
      </Suspense>

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
