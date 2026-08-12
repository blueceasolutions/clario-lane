import { useState } from 'react'
import { Badge, Button, Card, CardContent } from '@/components'
import { DisplayText } from '@/components/exercises/shared'
import {
  fetchRace,
  fetchRaceResults,
  fetchRaceResultsKey,
  fetchUserProfile,
  submitRaceResultMutation,
} from '@/integration'
import { useRaceUpdates } from '@/hooks'
import { splitIntoWords } from '@/lib'
import type { Question } from '@/types'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { Swords, Trophy } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/dashboard/race/$raceId')({
  component: RouteComponent,
})

// Kept short (2 questions, not the full set) so a race stays snappy --
// this is a comprehension spot-check for the race, not a full quiz.
const RACE_QUIZ_QUESTION_COUNT = 2
const MIN_ELAPSED_MINUTES = 1 / 60 // 1 second floor, guards div-by-~0 on an instant click

function RouteComponent() {
  const { raceId } = Route.useParams()
  const { data: userProfile } = useQuery(fetchUserProfile)
  const { data: race } = useQuery(fetchRace(raceId))
  const { data: results } = useQuery(fetchRaceResults(raceId))
  useRaceUpdates(raceId)
  const queryClient = useQueryClient()

  const [phase, setPhase] = useState<'reading' | 'quiz'>('reading')
  const [answers, setAnswers] = useState<boolean[]>([])
  const [quizIndex, setQuizIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [wpm, setWpm] = useState(0)

  const { mutate: submitResult, isPending: isSubmitting } = useMutation({
    ...submitRaceResultMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [fetchRaceResultsKey, raceId],
      })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit your result')
    },
  })

  if (!race || !userProfile) {
    return (
      <div className='max-w-xl mx-auto py-16 text-center text-muted-foreground'>
        <div className='h-8 w-8 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent' />
      </div>
    )
  }

  const isMe = (uid: string) => uid === userProfile.id
  const myResult = results?.find((r) => isMe(r.user_id))
  const opponentResult = results?.find((r) => !isMe(r.user_id))

  if (race.status === 'waiting') {
    return (
      <motion.div className='max-w-xl mx-auto space-y-6 text-center'>
        <Swords className='w-10 h-10 mx-auto text-muted-foreground' />
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Waiting for an opponent…
          </h2>
          <p className='text-muted-foreground text-sm mt-1'>
            Share this room code. The race starts the moment they join.
          </p>
        </div>
        <div className='text-4xl font-bold tracking-[0.3em] py-4'>
          {race.room_code}
        </div>
      </motion.div>
    )
  }

  if (race.status === 'finished') {
    const ers = (r: { wpm: number; comprehension: number } | undefined) =>
      r ? Math.round((r.wpm * r.comprehension) / 100) : 0
    const myErs = ers(myResult)
    const opponentErs = ers(opponentResult)
    const winner = myErs === opponentErs ? 'tie' : myErs > opponentErs ? 'me' : 'opponent'

    return (
      <motion.div className='max-w-xl mx-auto space-y-6'>
        <div className='text-center'>
          <Trophy className='w-10 h-10 mx-auto text-amber-500 mb-2' />
          <h2 className='text-2xl font-bold tracking-tight'>
            {winner === 'tie'
              ? "It's a tie!"
              : winner === 'me'
                ? 'You won!'
                : 'Your opponent won!'}
          </h2>
          <p className='text-muted-foreground text-sm mt-1'>
            Ranked by effective reading speed (WPM × comprehension).
          </p>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          {[
            { label: 'You', result: myResult, ers: myErs },
            { label: 'Opponent', result: opponentResult, ers: opponentErs },
          ].map(({ label, result, ers: entryErs }) => (
            <Card key={label}>
              <CardContent className='p-5 space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='font-semibold'>{label}</span>
                  {(winner === 'me' && label === 'You') ||
                  (winner === 'opponent' && label === 'Opponent') ? (
                    <Badge>Winner</Badge>
                  ) : null}
                </div>
                <p className='text-3xl font-bold'>{result?.wpm ?? '—'}</p>
                <p className='text-sm text-muted-foreground'>WPM</p>
                <p className='text-sm'>
                  {result ? Math.round(result.comprehension) : '—'}%
                  comprehension
                </p>
                <p className='text-sm text-muted-foreground'>
                  {entryErs} effective WPM
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button asChild className='w-full'>
          <Link to='/dashboard/race'>Race Again</Link>
        </Button>
      </motion.div>
    )
  }

  // status === 'racing'
  if (myResult) {
    return (
      <motion.div className='max-w-xl mx-auto space-y-4 text-center py-12'>
        <div className='h-8 w-8 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent' />
        <p className='text-muted-foreground'>
          Waiting for your opponent to finish…
        </p>
      </motion.div>
    )
  }

  const passage = race.passages
  const questions = (
    (passage.questions as unknown as Question[] | null) ?? []
  ).slice(0, RACE_QUIZ_QUESTION_COUNT)

  const handleFinishReading = () => {
    const totalWords = splitIntoWords(passage.text).length
    const elapsedMinutes = Math.max(
      race.started_at
        ? (Date.now() - new Date(race.started_at).getTime()) / 60000
        : MIN_ELAPSED_MINUTES,
      MIN_ELAPSED_MINUTES,
    )
    setWpm(Math.round(totalWords / elapsedMinutes))

    if (questions.length === 0) {
      submitResult({
        race_id: raceId,
        user_id: userProfile.id,
        wpm: Math.round(totalWords / elapsedMinutes),
        comprehension: 100,
      })
      return
    }

    setPhase('quiz')
  }

  const handleSelectAnswer = (index: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(index)
    const isCorrect = index === questions[quizIndex]?.correctIndex
    const nextAnswers = [...answers, isCorrect]
    setAnswers(nextAnswers)

    setTimeout(() => {
      if (quizIndex + 1 < questions.length) {
        setQuizIndex(quizIndex + 1)
        setSelectedAnswer(null)
      } else {
        const comprehension =
          (nextAnswers.filter(Boolean).length / nextAnswers.length) * 100
        submitResult({
          race_id: raceId,
          user_id: userProfile.id,
          wpm,
          comprehension,
        })
      }
    }, 700)
  }

  if (phase === 'quiz') {
    const question = questions[quizIndex]
    return (
      <motion.div className='max-w-xl mx-auto space-y-6'>
        <div className='text-center'>
          <p className='text-sm text-muted-foreground'>
            Quick check {quizIndex + 1} of {questions.length}
          </p>
          <h3 className='text-xl mt-1'>{question?.question}</h3>
        </div>
        <div className='space-y-3'>
          {question?.options.map((option, index) => (
            <button
              key={index}
              disabled={selectedAnswer !== null || isSubmitting}
              onClick={() => handleSelectAnswer(index)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all disabled:cursor-not-allowed ${
                selectedAnswer === null
                  ? 'border-border hover:border-primary/40'
                  : index === question.correctIndex
                    ? 'border-green-500/40 bg-green-50/10 dark:bg-green-500/20'
                    : index === selectedAnswer
                      ? 'border-red-500/40 bg-red-50/10 dark:bg-red-500/20'
                      : 'border-border opacity-50'
              }`}>
              {option}
            </button>
          ))}
        </div>
      </motion.div>
    )
  }

  // phase === 'reading'
  return (
    <motion.div className='max-w-2xl mx-auto space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>{passage.title}</h2>
        <Badge variant='outline'>{passage.difficulty}</Badge>
      </div>
      <Card>
        <CardContent className='p-6'>
          <DisplayText className='whitespace-pre-line leading-relaxed'>
            {passage.text}
          </DisplayText>
        </CardContent>
      </Card>
      <Button size='xl' className='w-full' onClick={handleFinishReading}>
        Finished Reading
      </Button>
    </motion.div>
  )
}
