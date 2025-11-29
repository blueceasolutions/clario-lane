import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components'
import {
  Award,
  TrendingUp,
  Calendar,
  Target,
  Trophy,
  Flame,
  CheckCircle2,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useUserProfileStore } from '@/store'
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

export const Route = createFileRoute('/dashboard/_dashboardLayout/progress')({
  component: RouteComponent,
})

export function RouteComponent() {
  const userProfile = useUserProfileStore()

  const { data: sessions } = useQuery({
    queryKey: ['practice_sessions', userProfile.id],
    queryFn: () => supabaseService.getPracticedSessions(userProfile.id),
    enabled: !!userProfile.id,
  })

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

  const badges = [
    {
      id: 'first_drill',
      name: 'First Steps',
      icon: '🎯',
      earned: (sessions?.length || 0) > 0,
      description: 'Completed your first drill',
    },
    {
      id: 'week_streak',
      name: 'Week Warrior',
      icon: '🔥',
      earned: (userProfile.streak_days || 0) >= 7,
      description: '7-day practice streak',
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      icon: '⚡',
      earned: (userProfile.current_wpm || 0) >= 400,
      description: 'Reach 400 WPM',
    },
    {
      id: 'comprehension_master',
      name: 'Comprehension Master',
      icon: '🧠',
      earned: (userProfile.current_comprehension_score || 0) >= 90,
      description: '90%+ comprehension rate',
    },
    {
      id: 'dedicated',
      name: 'Dedicated Reader',
      icon: '📚',
      earned: (userProfile.streak_days || 0) >= 30,
      description: '30-day practice streak',
    },
    {
      id: 'milestone_500',
      name: '500 Club',
      icon: '🏆',
      earned: (userProfile.current_wpm || 0) >= 500,
      description: 'Reach 500 WPM',
    },
  ]

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
      <div className='grid md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-3 mb-2'>
              <TrendingUp className='w-5 h-5 text-green-600' />
              <span className='text-sm'>Improvement</span>
            </div>
            <div className='text-2xl text-primary'>
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
            <p className='text-sm mt-1'>from baseline</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-3 mb-2'>
              <Calendar className='w-5 h-5 text-blue-600' />
              <span className='text-sm'>Sessions</span>
            </div>
            <div className='text-2xl text-primary'>
              {userProfile.total_sessions || 0}
            </div>
            <p className='text-sm mt-1'>total completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-3 mb-2'>
              <Flame className='w-5 h-5 text-orange-600' />
              <span className='text-sm'>Best Streak</span>
            </div>
            <div className='text-2xl text-primary'>
              {userProfile.streak_days} days
            </div>
            <p className='text-sm mt-1'>current streak</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-3 mb-2'>
              <Trophy className='w-5 h-5 text-yellow-600' />
              <span className='text-sm'>Badges</span>
            </div>
            <div className='text-2xl text-primary'>
              {badges.filter((b) => b.earned).length}/{badges.length}
            </div>
            <p className='text-sm mt-1'>earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className='grid md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Reading Speed Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={weeklyProgress}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                  <XAxis dataKey='day' stroke='#6b7280' />
                  <YAxis stroke='#6b7280' />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type='monotone'
                    dataKey='wpm'
                    stroke='#4f46e5'
                    strokeWidth={2}
                    dot={{ fill: '#4f46e5', r: 4 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comprehension Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={weeklyProgress}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                  <XAxis dataKey='day' stroke='#6b7280' />
                  <YAxis stroke='#6b7280' domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type='monotone'
                    dataKey='comprehension'
                    stroke='#10b981'
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={sessionData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                <XAxis dataKey='week' stroke='#6b7280' />
                <YAxis yAxisId='left' stroke='#6b7280' />
                <YAxis yAxisId='right' orientation='right' stroke='#6b7280' />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar
                  yAxisId='left'
                  dataKey='sessions'
                  fill='#4f46e5'
                  name='Sessions'
                />
                <Bar
                  yAxisId='right'
                  dataKey='avgWPM'
                  fill='#06b6d4'
                  name='Avg WPM'
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className='grid md:grid-cols-2 gap-6'>
        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Award className='w-5 h-5 text-yellow-600' />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-3'>
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border-2 text-center ${
                    badge.earned
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}>
                  <div className='text-3xl mb-2'>{badge.icon}</div>
                  <h3 className='text-sm mb-1'>{badge.name}</h3>
                  <p className='text-xs'>{badge.description}</p>
                  {badge.earned && (
                    <Badge className='mt-2 bg-yellow-500 text-white text-xs'>
                      Earned
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Target className='w-5 h-5 text-indigo-600' />
              Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {milestones.map((milestone, idx) => (
                <div key={milestone.id} className='flex items-start gap-3'>
                  <div className='relative'>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        milestone.completed ? 'bg-green-500' : 'bg-gray-200'
                      }`}>
                      {milestone.completed ? (
                        <CheckCircle2 className='w-4 h-4 text-white' />
                      ) : (
                        <span className='text-gray-500 text-sm'>{idx + 1}</span>
                      )}
                    </div>
                    {idx < milestones.length - 1 && (
                      <div
                        className={`absolute left-1/2 top-8 w-0.5 h-6 -translate-x-1/2 ${
                          milestone.completed ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                  <div className='flex-1 pb-6'>
                    <h3
                      className={`mb-1 ${
                        milestone.completed ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                      {milestone.title}
                    </h3>
                    <p className='text-sm'>{milestone.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
