import { useMemo, useState } from 'react'
import { Badge, Button, Card, CardContent } from '@/components'
import {
  fetchUserProfile,
  fetchVocabularyReviews,
  fetchVocabularyReviewsKey,
  reviewVocabularyWordMutation,
} from '@/integration'
import type { VocabularyReview } from '@/integration/queries/fetchVocabularyReviews'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { BookMarked, Eye } from 'lucide-react'

export const Route = createFileRoute('/dashboard/vocabulary')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: userProfile } = useQuery(fetchUserProfile)
  const { data: reviews } = useQuery(fetchVocabularyReviews(userProfile?.id))
  const queryClient = useQueryClient()
  const { mutate: submitReview } = useMutation({ ...reviewVocabularyWordMutation })
  const [revealedId, setRevealedId] = useState<string | null>(null)

  const allReviews = useMemo(() => reviews ?? [], [reviews])
  const dueReviews = useMemo(() => {
    const now = Date.now()
    return allReviews.filter(
      (review) => new Date(review.next_review_at).getTime() <= now,
    )
  }, [allReviews])
  const upcomingCount = allReviews.length - dueReviews.length

  const handleReview = (review: VocabularyReview, remembered: boolean) => {
    submitReview(
      {
        id: review.id,
        currentIntervalDays: review.interval_days,
        currentStreak: review.correct_streak,
        remembered,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [fetchVocabularyReviewsKey],
          })
        },
      },
    )
    setRevealedId(null)
  }

  return (
    <motion.div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>
          Vocabulary Review
        </h2>
        <p className='text-muted-foreground text-sm mt-1'>
          Words tied to quiz questions you missed, queued for
          spaced-repetition review.
        </p>
      </div>

      {dueReviews.length === 0 ? (
        <Card>
          <CardContent className='p-8 text-center text-muted-foreground space-y-1'>
            <BookMarked className='w-8 h-8 mx-auto mb-2 opacity-50' />
            {allReviews.length === 0 ? (
              <p>
                Miss a quiz question with a highlighted vocabulary word and
                it'll show up here for review.
              </p>
            ) : (
              <p>
                Nothing due for review right now
                {upcomingCount > 0
                  ? ` — ${upcomingCount} word${upcomingCount === 1 ? '' : 's'} scheduled for later.`
                  : '.'}
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {dueReviews.map((review) => {
            const isRevealed = revealedId === review.id
            return (
              <Card key={review.id}>
                <CardContent className='p-5 flex flex-col gap-3'>
                  <div className='flex items-center justify-between gap-2'>
                    <h3 className='text-xl font-semibold capitalize'>
                      {review.word}
                    </h3>
                    {review.correct_streak > 0 && (
                      <Badge variant='secondary' className='shrink-0'>
                        {review.correct_streak}x streak
                      </Badge>
                    )}
                  </div>

                  {isRevealed ? (
                    <div className='text-sm text-muted-foreground space-y-1'>
                      <p>{review.context}</p>
                      <p className='text-foreground'>
                        Answer: {review.correct_answer}
                      </p>
                    </div>
                  ) : (
                    <Button
                      variant='outline'
                      className='gap-2'
                      onClick={() => setRevealedId(review.id)}>
                      <Eye className='w-4 h-4' />
                      Show context
                    </Button>
                  )}

                  {isRevealed && (
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        className='flex-1'
                        onClick={() => handleReview(review, false)}>
                        Still learning
                      </Button>
                      <Button
                        className='flex-1'
                        onClick={() => handleReview(review, true)}>
                        Got it
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {dueReviews.length > 0 && upcomingCount > 0 && (
        <p className='text-sm text-muted-foreground text-center'>
          {upcomingCount} more word{upcomingCount === 1 ? '' : 's'} scheduled
          for later.
        </p>
      )}
    </motion.div>
  )
}
