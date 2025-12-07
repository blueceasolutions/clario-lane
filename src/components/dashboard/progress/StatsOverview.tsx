import { Card, CardContent } from '@/components'
import { TrendingUp, Calendar, Flame, Star, TrendingDown } from 'lucide-react'
import type { UserProfileType } from '@/types'
import { useGamificationStore } from '@/store/gamification/useGamificationStore'
import { cn } from '@/lib'

type Props = {
  userProfile: UserProfileType
}

export const StatsOverview = ({ userProfile }: Props) => {
  const { stats: gamificationStats } = useGamificationStore()
  const improvement = userProfile.baseline_wpm
    ? Math.round(
        ((userProfile.current_wpm! - userProfile.baseline_wpm!) /
          userProfile.baseline_wpm!) *
          100
      )
    : 0

  return (
    <div className='grid md:grid-cols-4 gap-4'>
      <Card>
        <CardContent className=''>
          <div className='flex items-center gap-3 mb-2'>
            <span
              className={cn(
                improvement > 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-400'
              )}>
              {improvement > 0 ? (
                <TrendingUp className='w-5 h-5' />
              ) : (
                <TrendingDown className='w-5 h-5' />
              )}
            </span>
            <span className='text-sm text-muted-foreground'>Improvement</span>
          </div>
          <div className='text-2xl font-bold text-primary'>
            {improvement > 0 ? `+${improvement}` : improvement}%
          </div>
          <p className='text-sm mt-1 text-muted-foreground'>from baseline</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className=''>
          <div className='flex items-center gap-3 mb-2'>
            <Calendar className='w-5 h-5 text-blue-600 dark:text-blue-400' />
            <span className='text-sm text-muted-foreground'>Sessions</span>
          </div>
          <div className='text-2xl font-bold text-primary'>
            {userProfile.total_sessions || 0}
          </div>
          <p className='text-sm mt-1 text-muted-foreground'>total completed</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className=''>
          <div className='flex items-center gap-3 mb-2'>
            <Flame className='w-5 h-5 text-orange-600 dark:text-orange-400' />
            <span className='text-sm text-muted-foreground'>Best Streak</span>
          </div>
          <div className='text-2xl font-bold text-primary'>
            {gamificationStats?.longest_streak ?? userProfile.streak_days} days
          </div>
          <p className='text-sm mt-1 text-muted-foreground'>
            current:{' '}
            {gamificationStats?.current_streak ?? userProfile.streak_days}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className=''>
          <div className='flex items-center gap-3 mb-2'>
            <Star className='w-5 h-5 text-yellow-600 dark:text-yellow-400' />
            <span className='text-sm text-muted-foreground'>Level</span>
          </div>
          <div className='text-2xl font-bold text-primary'>
            {gamificationStats?.level ?? userProfile.level ?? 1}
          </div>
          <p className='text-sm mt-1 text-muted-foreground'>
            {gamificationStats?.xp.toLocaleString() ?? 0} total XP
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
