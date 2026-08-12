import { Badge, Card, CardContent } from '@/components'
import { fetchUserProfile, fetchWeeklyLeaderboard } from '@/integration'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { Trophy } from 'lucide-react'

export const Route = createFileRoute('/dashboard/leaderboard')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(fetchWeeklyLeaderboard)
  },
})

function RouteComponent() {
  const { data: userProfile } = useQuery(fetchUserProfile)
  const { data: leaderboard } = useQuery(fetchWeeklyLeaderboard)

  const rows = leaderboard ?? []

  return (
    <motion.div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>
          Weekly Leaderboard
        </h2>
        <p className='text-muted-foreground text-sm mt-1'>
          Ranked by XP earned this week, among readers who've opted in.
          Resets every Monday.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className='p-8 text-center text-muted-foreground space-y-1'>
            <Trophy className='w-8 h-8 mx-auto mb-2 opacity-50' />
            <p>
              No one's opted in yet — turn on "Weekly Leaderboard" in
              Settings to be the first.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className='p-0 divide-y'>
            {rows.map((row) => {
              const isMe = row.user_id === userProfile?.id
              return (
                <div
                  key={row.user_id}
                  className={`flex items-center justify-between px-5 py-3 ${
                    isMe ? 'bg-primary/5' : ''
                  }`}>
                  <div className='flex items-center gap-3'>
                    <span className='w-6 text-center text-sm font-semibold text-muted-foreground'>
                      {row.rank}
                    </span>
                    <span className='font-medium'>
                      {row.name}
                      {isMe ? ' (you)' : ''}
                    </span>
                  </div>
                  <Badge variant='secondary'>{row.weekly_xp} XP</Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
