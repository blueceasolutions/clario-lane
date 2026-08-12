import { useState, useEffect } from 'react'
import { Button, Card } from '@/components'
import { CheckCircle, XCircle } from 'lucide-react'
import { usePracticeStore, useAppStore } from '@/store'
import { useGamificationStore } from '@/store/gamification/useGamificationStore'
import { PracticeStep, calculateNextDifficulty, calculateNextWpm } from '@/lib'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  captureVocabularyMissesMutation,
  fetchPracticeSessionsKey,
  fetchPractices,
  fetchSession,
  fetchUserProfileKey,
  fetchWordsReadTodayKey,
  sessionMutation,
} from '@/integration'
import type { RecordedSessionResponse } from '@/integration/mutations/sessionMutation'
import type { MissedVocabularyWord } from '@/integration/mutations/vocabularyReviewMutation'
import {
  fetchUserStats,
  fetchUserStatsKey,
} from '@/integration/queries/fetchUserStats'

import { useLocation } from '@tanstack/react-router'

export function ComprehensionQuiz() {
  const {
    passage,
    wpm,
    duration,
    wordsRead,
    startTime,
    elapsedTime,
    isCustomPassage,
    setComprehension,
    setCorrectAnswers,
    setTotalQuestions,
    setStep,
    setLoading,
    setNextWpm,
    setNextDifficulty,
  } = usePracticeStore()
  const questions = passage?.questions ?? []
  const hasQuiz = questions.length > 0
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [showResult, setShowResult] = useState(false)
  const [exerciseUuid, setExerciseUuid] = useState<string | undefined>()

  const currentQuestion = questions?.[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions?.length - 1

  const handleSelectAnswer = (index: number) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(index)
      setShowResult(true)

      const isCorrect = index === currentQuestion?.correctIndex
      setAnswers([...answers, isCorrect])
    }
  }

  const queryClient = useQueryClient()

  const { mutate, status: mutationStatus } = useMutation({
    ...sessionMutation,
    networkMode: 'offlineFirst',
  })
  const { mutate: captureVocabularyMisses } = useMutation({
    ...captureVocabularyMissesMutation,
    networkMode: 'offlineFirst',
  })
  const { activePractice } = useAppStore()
  const location = useLocation()

  // Extract exercise type from URL path as fallback
  // URL format: /dashboard/practice/{exerciseType}/{practiceId}
  const getExerciseFromPath = (): string | undefined => {
    const pathParts = location.pathname.split('/')
    const exerciseSegment = pathParts[3] // e.g., 'speedreading', 'teleprompter', 'wordchunking'

    // Map URL segment to exercise enum
    const exerciseMap: Record<string, string> = {
      speedreading: 'SPEED_READING',
      teleprompter: 'TELEPROMPTER',
      wordchunking: 'WORD_CHUNKING',
    }

    return exerciseMap[exerciseSegment]
  }

  // const exerciseId = activePractice?.exercise || getExerciseFromPath()

  // Fetch exercise UUID from database
  useEffect(() => {
    const fetchExerciseId = async () => {
      const exerciseType = activePractice?.exercise || getExerciseFromPath()
      if (exerciseType) {
        const practices = await queryClient.fetchQuery(fetchPractices)
        const match = practices?.find((p) => p.exercise === exerciseType)

        if (!match) {
          console.error('Failed to find exercise ID for', exerciseType)
          return
        }

        setExerciseUuid(match.id)
      }
    }

    fetchExerciseId()
  }, [activePractice, queryClient])

  const {
    stats: currentStats,
    openVictoryModal,
    openLevelUpModal,
  } = useGamificationStore()

  // Custom (user-pasted) passages have no comprehension questions -- give
  // the benefit of the doubt (100%) rather than blocking the session on an
  // assessment that doesn't exist, or fabricating one.
  const submitSession = (correctAnswers: number, totalQuestions: number) => {
    const comprehension = totalQuestions > 0
      ? (correctAnswers / totalQuestions) * 100
      : 100

    const actualNextWpm = calculateNextWpm(wpm, comprehension)
    const actualNextDifficulty = calculateNextDifficulty(
      passage?.difficulty ?? 'Medium',
      comprehension,
    )

    // Questions are answered in order, so answers[i] lines up with
    // questions[i] -- a wrong answer on a question with a vocabWord queues
    // that word for spaced-repetition review instead of the miss being
    // discarded once the quiz closes.
    const missedWords: MissedVocabularyWord[] = questions
      .filter((question, index) => answers[index] === false && question.vocabWord)
      .map((question) => ({
        word: question.vocabWord!,
        context: question.question,
        correctAnswer: question.options[question.correctIndex],
        passageId: isCustomPassage ? null : passage?.id || null,
      }))

    const payload = {
      correctAnswers,
      totalQuestions,
      comprehension,
      currentStep: PracticeStep.enum.Results,
      loading: false,
      nextWpm: actualNextWpm,
      nextDifficulty: actualNextDifficulty,
    }

    mutate(
      {
        comprehension,
        correct_answers: correctAnswers,
        duration: duration!,
        elapsed_time: elapsedTime,
        start_time: startTime,
        total_questions: totalQuestions,
        total_words: wordsRead!,
        wpm: wpm,
        exercise_id: exerciseUuid!,
        // Custom passages were never persisted to the passages table, so
        // there's no real id to reference -- passage_id is nullable for
        // exactly this case.
        passage_id: isCustomPassage ? null : passage?.id || null,
        next_wpm: actualNextWpm,
        next_difficulty: actualNextDifficulty,
      },
      {
          onSuccess: async (response: RecordedSessionResponse | null) => {
            // Get user ID from current stats or auth
            let userId = currentStats?.user_id
            if (!userId) {
              const session = await queryClient.fetchQuery(fetchSession)
              userId = session?.user?.id
            }

            if (userId && missedWords.length > 0) {
              captureVocabularyMisses({ userId, words: missedWords })
            }

            if (userId) {
              // Fetch updated stats to calculate XP gained and check for level up
              const newStats = await queryClient.fetchQuery(
                fetchUserStats(userId),
              )

              const newAchievementsData = response?.data?.new_achievements || []
              const { achievements: allAchievements } =
                useGamificationStore.getState()

              const newAchievementsWithTitles = newAchievementsData.map(
                (na: RecordedSessionResponse['data']['new_achievements'][number]) => {
                  const ach = allAchievements.find(
                    (a) => a.id === na.achievement_id,
                  )
                  return {
                    achievement_id: na.achievement_id,
                    title: ach?.title || na.achievement_id,
                  }
                },
              )

              // Use response data if stats fetch fails or is delayed
              const xpGained =
                response?.data?.xp_gained ||
                (newStats && currentStats ? newStats.xp - currentStats.xp : 0)
              const currentLevel =
                response?.data?.new_level || newStats?.level || 1
              const currentXP = newStats?.xp || 0
              const isLevelUp =
                (response?.data?.new_level ?? 0) > (currentStats?.level || 1) ||
                (newStats &&
                  currentStats &&
                  newStats.level > currentStats.level)

              openVictoryModal({
                xpGained: xpGained > 0 ? xpGained : 0,
                wordsRead: wordsRead!,
                timeSpentSeconds: duration!,
                currentLevel,
                currentXP,
                isLevelUp: !!isLevelUp,
                newAchievements: newAchievementsWithTitles,
              })

              if (isLevelUp) {
                openLevelUpModal(currentLevel)
              }

              // Update store with new stats if available
              if (newStats) {
                useGamificationStore.getState().setStats(newStats)
              }
            } else {
              // Could not determine user ID for stats update
            }

            // Invalidate queries to refresh dashboard stats
            await queryClient.invalidateQueries({
              queryKey: [fetchUserProfileKey],
            })
            await queryClient.invalidateQueries({ queryKey: ['progress_data'] })
            await queryClient.invalidateQueries({
              queryKey: [fetchPracticeSessionsKey],
            })
            await queryClient.invalidateQueries({
              queryKey: [fetchWordsReadTodayKey],
            })
            await queryClient.invalidateQueries({
              queryKey: [fetchUserStatsKey],
            })

            setCorrectAnswers(payload.correctAnswers)
            setTotalQuestions(payload.totalQuestions)
            setComprehension(payload.comprehension)
            setNextWpm(payload.nextWpm)
            setNextDifficulty(payload.nextDifficulty)
            setLoading(false)
            setStep(payload.currentStep)
          },
          onError: (error) => {
            console.error('Failed to save session:', error)
            // Still proceed to results even if save fails?
            // Maybe show a toast error but let them see results.
            setCorrectAnswers(payload.correctAnswers)
            setTotalQuestions(payload.totalQuestions)
            setComprehension(payload.comprehension)
            setNextWpm(payload.nextWpm)
            setNextDifficulty(payload.nextDifficulty)
            setLoading(false)
            setStep(payload.currentStep)
          },
      },
    )
  }

  const handleNext = () => {
    if (isLastQuestion) {
      const correctAnswers = answers.filter((a) => a).length
      submitSession(correctAnswers, questions.length)
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  // No quiz to take (custom passage) -- record the session as soon as we
  // know which exercise this was, instead of showing an empty quiz.
  useEffect(() => {
    if (!hasQuiz && exerciseUuid && mutationStatus === 'idle') {
      submitSession(0, 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasQuiz, exerciseUuid, mutationStatus])

  if (!hasQuiz) {
    return (
      <div className='w-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-3 py-24 text-center text-muted-foreground'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
        <p>No quiz for custom text — recording your session…</p>
      </div>
    )
  }

  return (
    <div className='w-full max-w-2xl mx-auto space-y-6 relative'>
      {/* Progress */}
      <div className='flex items-center justify-between text-sm text-muted-foreground'>
        <span>
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
        <span>{answers.filter((a) => a).length} correct</span>
      </div>

      {/* Question Card */}
      <Card className='p-0 mb-20 md:mb-6 border-0 bg-transparent shadow-none md:shadow md:bg-card md:border md:p-6 space-y-3 '>
        <div>
          <h3 className='text-xl'>{currentQuestion?.question}</h3>
        </div>

        {/* Options */}
        <div className='space-y-3'>
          {currentQuestion?.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrect = index === currentQuestion?.correctIndex
            const showCorrect = showResult && isCorrect
            const showIncorrect = showResult && isSelected && !isCorrect

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all
                  ${!showResult && !isSelected ? 'border-border hover:border-primary/10 hover:bg-primary/5' : ''}
                  ${isSelected && !showResult ? 'border-primary bg-accent' : ''}
                  ${showCorrect ? 'border-green-500/20 bg-green-50/10 dark:bg-green-500/20' : ''}
                  ${showIncorrect ? 'border-red-500/10 bg-red-50/5 dark:bg-red-500/20' : ''}
                  ${selectedAnswer !== null && !isSelected && !showCorrect ? 'opacity-50' : ''}
                  disabled:cursor-not-allowed
                `}>
                <div className='flex items-center justify-between'>
                  <span>{option}</span>
                  {showCorrect && (
                    <CheckCircle className='h-5 w-5 text-green-600 dark:text-green-400' />
                  )}
                  {showIncorrect && (
                    <XCircle className='h-5 w-5 text-red-600 dark:text-red-400' />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Feedback */}
        {showResult && (
          <div
            className={`p-4 rounded-lg ${
              selectedAnswer === currentQuestion?.correctIndex
                ? 'border-green-500/20 border bg-green-500/15 dark:border-green-400/30 text-green-900 dark:text-green-100'
                : 'border-red-500/20 border-2 bg-red-500/15 dark:border-red-400/5 dark:bg-red-400/20 text-red-900 dark:text-red-100'
            }`}>
            {selectedAnswer === currentQuestion?.correctIndex ? (
              <p>Correct! Well done.</p>
            ) : (
              <p>
                Incorrect. The correct answer is:{' '}
                {currentQuestion?.options[currentQuestion?.correctIndex]}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Next Button */}
      {showResult && (
        <div className='w-full fixed bottom-0 left-0 right-0 z-50 md:relative md:bottom-auto md:left-auto md:right-auto bg-gradient-to-t from-background/50 via-background/5 to-transparent backdrop-blur-sm'>
          <div className='py-4 px-4 pt-6 md:p-0'>
            <Button
              onClick={handleNext}
              size='xl'
              className='w-full'
              disabled={mutationStatus === 'pending'}>
              {mutationStatus === 'pending'
                ? 'Submitting...'
                : isLastQuestion
                  ? 'Finish Quiz'
                  : 'Next Question'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
