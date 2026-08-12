import { Card, CardContent } from '@/components'
import { fetchPracticeSessions } from '@/integration'
import { calculateBestTimeOfDay, type TimeOfDayBucket } from '@/lib'
import { useQuery } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'

type Props = {
  userId: string | undefined
}

// A larger sample than the home page's default recent-sessions fetch
// (which stays small on purpose, for the "last few sessions" mini chart)
// -- this needs more history to say anything meaningful about a pattern.
const INSIGHT_SAMPLE_SIZE = 50

const BUCKET_COPY: Record<TimeOfDayBucket, string> = {
  Morning: 'in the morning (5–11am)',
  Afternoon: 'in the afternoon (12–4pm)',
  Evening: 'in the evening (5–8pm)',
  Night: 'at night (9pm–4am)',
}

export function BestTimeInsightCard({ userId }: Props) {
  const { data: sessions } = useQuery(
    fetchPracticeSessions(userId, INSIGHT_SAMPLE_SIZE),
  )

  const insight = calculateBestTimeOfDay(
    (sessions ?? [])
      .filter((s) => s.created_at)
      .map((s) => ({
        wpm: s.wpm,
        comprehension: s.comprehension,
        createdAt: s.created_at!,
      })),
  )

  if (!insight) return null

  return (
    <Card>
      <CardContent className='p-5 flex items-center gap-3'>
        <Sparkles className='w-5 h-5 text-amber-500 shrink-0' />
        <div>
          <p className='font-medium'>
            You read best {BUCKET_COPY[insight.bucket]}
          </p>
          <p className='text-sm text-muted-foreground'>
            Average effective speed of {insight.avgEffectiveWpm} WPM there,
            across {insight.sessionCount} sessions. Consider practicing then.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
