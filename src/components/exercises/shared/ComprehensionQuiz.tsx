import { useState, useEffect } from 'react'
import { Button, Card } from '@/components'
import { CheckCircle, XCircle } from 'lucide-react'
import { usePracticeStore, useAppStore } from '@/store'
import { useGamificationStore } from '@/store/gamification/useGamificationStore'
import { PracticeStep } from '@/lib'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchPassageKey, sessionMutation } from '@/integration'
import {
  fetchUserStats,
  fetchUserStatsKey,
} from '@/integration/queries/fetchUserStats'
import { supabaseService } from '~supabase/clientServices'

import type { PassageResponse } from '@/types'
import { useLocation } from '@tanstack/react-router'

export function ComprehensionQuiz() {
  const { passage, updateStore, ...rest } = usePracticeStore()
  const questions = passage!.questions!
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

  const passageResponse = queryClient.getQueryData([
    fetchPassageKey,
  ]) as PassageResponse

  const { mutate, status: mutationStatus } = useMutation({
    ...sessionMutation,
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
        const { data, error } = await supabaseService.sp
          .from('exercises')
          .select('id')
          .eq('exercise', exerciseType)
          .single()

        if (error) {
          console.error('Failed to fetch exercise ID:', error)
          return
        }

        if (data?.id) {
          setExerciseUuid(data.id)
        }
      }
    }

    fetchExerciseId()
  }, [activePractice])

  const {
    stats: currentStats,
    openVictoryModal,
    openLevelUpModal,
  } = useGamificationStore()

  const handleNext = () => {
    if (isLastQuestion) {
      const correctAnswers = answers.filter((a) => a).length
      const comprehension = (correctAnswers / questions.length) * 100
      const payload = {
        correctAnswers,
        totalQuestions: questions.length,
        comprehension,
        currentStep: PracticeStep.enum.Results,
        loading: true,
      }

      mutate(
        {
          comprehension,
          correct_answers: correctAnswers,
          duration: rest.duration!,
          elapsed_time: rest.elapsedTime,
          start_time: rest.startTime,
          total_questions: questions.length,
          total_words: rest.wordsRead!,
          wpm: rest.wpm,
          exercise_id: exerciseUuid!,
          passage_id: passageResponse?.id,
        },
        {
          onSuccess: async (response: any) => {
            // Get user ID from current stats or auth
            let userId = currentStats?.user_id
            if (!userId) {
              const {
                data: { user },
              } = await supabaseService.sp.auth.getUser()
              userId = user?.id
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
                (na: any) => {
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
                response?.data?.new_level > (currentStats?.level || 1) ||
                (newStats &&
                  currentStats &&
                  newStats.level > currentStats.level)

              openVictoryModal({
                xpGained: xpGained > 0 ? xpGained : 0,
                wordsRead: rest.wordsRead!,
                timeSpentSeconds: rest.duration!,
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
            await queryClient.invalidateQueries({ queryKey: ['user_profile'] })
            await queryClient.invalidateQueries({ queryKey: ['progress_data'] })
            await queryClient.invalidateQueries({
              queryKey: ['practice_sessions'],
            })
            await queryClient.invalidateQueries({
              queryKey: ['words-read-today'],
            })
            await queryClient.invalidateQueries({
              queryKey: [fetchUserStatsKey],
            })

            updateStore(payload)
          },
          onError: (error) => {
            console.error('Failed to save session:', error)
            // Still proceed to results even if save fails?
            // Maybe show a toast error but let them see results.
            updateStore(payload)
          },
        },
      )
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  return (
    <div className='w-full max-w-2xl mx-auto space-y-6'>
      {/* Progress */}
      <div className='flex items-center justify-between text-sm text-muted-foreground'>
        <span>
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
        <span>{answers.filter((a) => a).length} correct</span>
      </div>

      {/* Question Card */}
      <Card className='p-6 space-y-6'>
        <div>
          <h3 className='text-xl mb-4'>{currentQuestion?.question}</h3>
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
                  ${showCorrect ? 'border-green-500/20 bg-green-50/20 dark:bg-green-950' : ''}
                  ${showIncorrect ? 'border-red-500/20 bg-red-50/20 dark:bg-red-950' : ''}
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
                ? 'bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100'
                : 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100'
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
        <div className='flex justify-end'>
          <Button
            onClick={handleNext}
            size='lg'
            disabled={mutationStatus === 'pending'}>
            {mutationStatus === 'pending'
              ? 'Submitting...'
              : isLastQuestion
                ? 'Finish Quiz'
                : 'Next Question'}
          </Button>
        </div>
      )}
    </div>
  )
}
