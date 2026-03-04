import { createFileRoute } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Progress,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components'
import { SeoHead } from '@/components/shared'
import { Trophy, Target, Users, ArrowRight, Timer, Star } from 'lucide-react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { fetchChallenges } from '@/integration/queries/fetchChallenges'

export const Route = createFileRoute('/dashboard/challenges')({
  component: RouteComponent,
})

export function RouteComponent() {
  const { data: challenges } = useQuery(fetchChallenges)

  // Mock leaderboard data (keep for now as no backend endpoint)
  const leaderboard = [
    {
      rank: 1,
      name: 'Sarah Chen',
      xp: 12500,
      avatar: 'SC',
      trend: 'up',
      wpm: 450,
    },
    {
      rank: 2,
      name: 'Mike Ross',
      xp: 11200,
      avatar: 'MR',
      trend: 'same',
      wpm: 425,
    },
    {
      rank: 3,
      name: 'Alex Kim',
      xp: 10800,
      avatar: 'AK',
      trend: 'down',
      wpm: 410,
    },
    {
      rank: 4,
      name: 'You',
      xp: 8500,
      avatar: 'ME',
      trend: 'up',
      wpm: 380,
      isCurrentUser: true,
    },
    {
      rank: 5,
      name: 'Emma Wilson',
      xp: 8200,
      avatar: 'EW',
      trend: 'down',
      wpm: 375,
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
        title='Challenges'
        description='Compete with others and complete daily reading challenges.'
      />
      {/* Active Challenges */}
      <section>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-semibold text-gray-900 flex items-center gap-2'>
            <Target className='w-5 h-5 text-indigo-600' />
            Active Challenges
          </h2>
          <Button variant='ghost' className='text-indigo-600'>
            View All
          </Button>
        </div>
        <div className='grid md:grid-cols-2 gap-4'>
          {challenges?.map((challenge) => (
            <Card key={challenge.id} className='overflow-hidden'>
              <CardContent className='p-0'>
                <div className='p-6'>
                  <div className='flex justify-between items-start mb-4'>
                    <div>
                      <Badge
                        variant='secondary'
                        className='mb-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'>
                        Medium {/* Mocked difficulty */}
                      </Badge>
                      <h3 className='text-lg font-semibold mb-1'>
                        {challenge.challenge}
                      </h3>
                      <p className='text-sm text-gray-600'>
                        {challenge.description}
                      </p>
                    </div>
                    <div className='bg-yellow-50 p-2 rounded-lg'>
                      <Trophy className='w-6 h-6 text-yellow-600' />
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <div className='flex justify-between text-sm mb-1'>
                        <span className='text-gray-600'>Progress</span>
                        <span className='font-medium'>0%</span>
                      </div>
                      <Progress value={0} className='h-2' />
                    </div>

                    <div className='flex items-center justify-between text-sm text-gray-500'>
                      <div className='flex items-center gap-4'>
                        <span className='flex items-center gap-1'>
                          <Timer className='w-4 h-4' />3 days left{' '}
                          {/* Mocked days left */}
                        </span>
                        <span className='flex items-center gap-1'>
                          <Star className='w-4 h-4 text-yellow-500' />
                          100 XP {/* Mocked XP */}
                        </span>
                      </div>
                      <Button size='sm' variant='outline'>
                        Join Challenge
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!challenges || challenges.length === 0) && (
            <div className='col-span-2 text-center py-10 text-gray-500'>
              No active challenges found. Check back later!
            </div>
          )}
        </div>
      </section>

      <div className='grid md:grid-cols-3 gap-6'>
        {/* Leaderboard */}
        <section className='md:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Trophy className='w-5 h-5 text-yellow-600' />
                Weekly Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {leaderboard.map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      user.isCurrentUser
                        ? 'bg-indigo-50 border border-indigo-100'
                        : 'hover:bg-gray-50'
                    }`}>
                    <div className='flex items-center gap-4'>
                      <div
                        className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${
                          user.rank <= 3
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                        {user.rank}
                      </div>
                      <Avatar>
                        <AvatarImage src={`/avatars/${user.avatar}.png`} />
                        <AvatarFallback>{user.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='font-medium text-gray-900'>{user.name}</p>
                        <p className='text-xs text-gray-500'>{user.wpm} WPM</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='font-bold text-indigo-600'>
                        {user.xp.toLocaleString()} XP
                      </p>
                      <p
                        className={`text-xs ${
                          user.trend === 'up'
                            ? 'text-green-600'
                            : user.trend === 'down'
                              ? 'text-red-600'
                              : 'text-gray-500'
                        }`}>
                        {user.trend === 'up'
                          ? '↑'
                          : user.trend === 'down'
                            ? '↓'
                            : '-'}{' '}
                        Rank
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant='outline' className='w-full mt-4'>
                View Full Leaderboard
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Community Goals */}
        <section>
          <Card className='h-full'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Users className='w-5 h-5 text-blue-600' />
                Community Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-center mb-6'>
                <div className='w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Target className='w-10 h-10 text-blue-600' />
                </div>
                <h3 className='font-semibold mb-1'>1 Million Words</h3>
                <p className='text-sm text-gray-600'>
                  Global reading goal for this week
                </p>
              </div>

              <div className='space-y-2 mb-6'>
                <div className='flex justify-between text-sm'>
                  <span className='font-medium text-blue-600'>75%</span>
                  <span className='text-gray-500'>750k / 1M</span>
                </div>
                <Progress value={75} className='h-2' />
              </div>

              <div className='space-y-4'>
                <div className='bg-gray-50 p-3 rounded-lg'>
                  <p className='text-sm font-medium mb-1'>Your Contribution</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    12,450
                    <span className='text-xs font-normal text-gray-500 ml-1'>
                      words
                    </span>
                  </p>
                </div>
                <Button className='w-full'>
                  Contribute Now <ArrowRight className='w-4 h-4 ml-2' />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </motion.div>
  )
}
