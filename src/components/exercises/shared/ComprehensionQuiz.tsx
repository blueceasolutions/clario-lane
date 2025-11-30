import { useState } from 'react'
import { Button, Card } from '@/components'
import { CheckCircle, XCircle } from 'lucide-react'
import { usePracticeStore } from '@/store'
import { PracticeStep } from '@/lib'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchPassageKey, sessionMutation } from '@/integration'

import type { PassageResponse } from '@/types'
import { useParams } from '@tanstack/react-router'

export function ComprehensionQuiz() {
  const { passage, updateStore, ...rest } = usePracticeStore()
  const questions = passage!.questions!
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [showResult, setShowResult] = useState(false)
  const { practiceId } = useParams({ strict: false })

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

  const { mutate } = useMutation(sessionMutation)

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

      mutate({
        comprehension,
        correct_answers: correctAnswers,
        duration: rest.duration!,
        elapsed_time: rest.elapsedTime,
        start_time: rest.startTime,
        total_questions: questions.length,
        total_words: rest.wordsRead!,
        wpm: rest.wpm,
        exercise_id: practiceId!,
        passage_id: passageResponse?.id,
      })

      updateStore(payload)
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
                  ${!showResult && !isSelected ? 'border-border hover:border-primary hover:bg-accent' : ''}
                  ${isSelected && !showResult ? 'border-primary bg-accent' : ''}
                  ${showCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}
                  ${showIncorrect ? 'border-red-500 bg-red-50 dark:bg-red-950' : ''}
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
          <Button onClick={handleNext} size='lg'>
            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
          </Button>
        </div>
      )}
    </div>
  )
}
