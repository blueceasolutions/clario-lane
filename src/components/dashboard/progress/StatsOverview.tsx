import { Card, CardContent } from '@/components'
import { TrendingUp, Calendar, Flame, Trophy } from 'lucide-react'
import type { UserProfileType } from '@/types'

type Props = {
  userProfile: UserProfileType
  badges: { earned: boolean }[]
}

export const StatsOverview = ({ userProfile, badges }: Props) => {
  console.log({ userProfile, badges })
  return (
    <div className='grid md:grid-cols-4 gap-4'>
      <Card>
        <CardContent className=''>
          <div className='flex items-center gap-3 mb-2'>
            <TrendingUp className='w-5 h-5 text-green-600 dark:text-green-400' />
            <span className='text-sm text-muted-foreground'>Improvement</span>
          </div>
          <div className='text-2xl font-bold text-primary'>
            +
            {userProfile.baseline_wpm
              ? Math.round(
                  ((userProfile.current_wpm! - userProfile.baseline_wpm!) /
                    userProfile.baseline_wpm!) *
                    100
                )
              : 0}
            %
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
            {userProfile.streak_days} days
          </div>
          <p className='text-sm mt-1 text-muted-foreground'>current streak</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className=''>
          <div className='flex items-center gap-3 mb-2'>
            <Trophy className='w-5 h-5 text-yellow-600 dark:text-yellow-400' />
            <span className='text-sm text-muted-foreground'>Badges</span>
          </div>
          <div className='text-2xl font-bold text-primary'>
            {badges.filter((b) => b.earned).length}/{badges.length}
          </div>
          <p className='text-sm mt-1 text-muted-foreground'>earned</p>
        </CardContent>
      </Card>
    </div>
  )
}
