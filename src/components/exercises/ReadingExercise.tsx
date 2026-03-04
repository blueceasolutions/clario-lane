import { useState, useEffect } from 'react'
import {
  RadioGroup,
  RadioGroupItem,
  Progress,
  Button,
  Card,
  CardContent,
} from '@/components'
import {
  X,
  Timer,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useOnboardingStore, usePracticeStore } from '@/store'
import { useMutation } from '@tanstack/react-query'
import { sessionMutation } from '@/integration'

interface ReadingExerciseProps {
  exerciseId?: string
  onComplete?: () => void
  onExit: () => void
}

export function ReadingExercise({
  // exerciseId,
  onComplete,
  onExit,
}: ReadingExerciseProps) {
  const { updateProfile, ...userProfile } = useOnboardingStore()
  const { passage } = usePracticeStore()
  const [stage, setStage] = useState<'reading' | 'questions' | 'results'>(
    'reading',
  )
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const setElapsedTime = useState(0)[1]

  const { mutate: saveSession, isPending: isSaving } =
    useMutation(sessionMutation)

  useEffect(() => {
    if (passage) {
      setStartTime(Date.now())
    }

    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - Date.now()) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [passage])

  if (!passage) {
    return (
      <div className='flex items-center justify-center min-h-[50vh]'>
        <Loader2 className='w-8 h-8 animate-spin text-indigo-600' />
      </div>
    )
  }

  const handleFinishReading = () => {
    setEndTime(Date.now())
    setStage('questions')
  }

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = answerIndex
    setAnswers(newAnswers)
  }

  const handleSubmit = () => {
    const timeInMinutes = (endTime - startTime) / 1000 / 60
    const wordCount = passage.text.split(' ').length
    const wpm = Math.round(wordCount / timeInMinutes)

    const correctAnswers = answers.filter(
      (answer, idx) => answer === passage.questions[idx].correctIndex,
    ).length
    const currentComprehensionScore = Math.round(
      (correctAnswers / passage.questions.length) * 100,
    )

    const xpEarned =
      50 +
      (currentComprehensionScore >= 80 ? 20 : 0) +
      (wpm > userProfile.current_wpm! ? 30 : 0)

    // Update local profile
    updateProfile({
      current_wpm: Math.max(userProfile.current_wpm!, wpm),
      current_comprehension_score: currentComprehensionScore,
      xp_earned: userProfile.xp_earned! + xpEarned,
      total_sessions: userProfile.total_sessions! + 1,
    })

    // Persist to backend
    saveSession({
      passage_id: passage.id,
      exercise_id: 'speed_reading', // TODO: Get real exercise ID
      wpm,
      next_wpm: userProfile.current_wpm!,
      comprehension: currentComprehensionScore,
      duration: Math.round((endTime - startTime) / 1000),
      total_words: wordCount,
      correct_answers: correctAnswers,
      total_questions: passage.questions.length,
      start_time: startTime,
      elapsed_time: Math.round((endTime - startTime) / 1000),
    })

    setStage('results')
  }

  const renderReading = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='max-w-4xl mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-indigo-900'>Speed Reading Exercise</h2>
          <p className='text-gray-600'>Read at your comfortable pace</p>
        </div>
        <Button variant='ghost' size='icon' onClick={onExit}>
          <X className='w-5 h-5' />
        </Button>
      </div>

      <Card className='mb-6'>
        <CardContent className='pt-6'>
          <div className='flex items-center gap-4 mb-4 p-4 bg-blue-50 rounded-lg'>
            <Timer className='w-5 h-5 text-blue-600' />
            <div className='flex-1'>
              <p className='text-sm text-blue-900'>
                Read the passage below, then click "I'm Done" when you finish.
                Focus on understanding while maintaining a good pace.
              </p>
            </div>
          </div>

          <div className='prose prose-lg max-w-none leading-relaxed text-gray-800 p-6'>
            {passage.text}
          </div>
        </CardContent>
      </Card>

      <div className='flex justify-center'>
        <Button size='lg' onClick={handleFinishReading} className='px-12'>
          I'm Done Reading
          <ArrowRight className='w-5 h-5 ml-2' />
        </Button>
      </div>
    </motion.div>
  )

  const renderQuestions = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='max-w-3xl mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-indigo-900'>Comprehension Check</h2>
          <p className='text-gray-600'>
            Answer these questions about what you read
          </p>
        </div>
        <Button variant='ghost' size='icon' onClick={onExit}>
          <X className='w-5 h-5' />
        </Button>
      </div>

      <div className='mb-4'>
        <Progress
          value={(answers.length / passage.questions.length) * 100}
          className='h-2'
        />
        <p className='text-sm text-gray-600 text-center mt-2'>
          {answers.length} of {passage.questions.length} answered
        </p>
      </div>

      <div className='space-y-6'>
        {passage.questions.map((q, qIdx) => (
          <Card key={qIdx}>
            <CardContent className='pt-6'>
              <h3 className='mb-4'>Question {qIdx + 1}</h3>
              <p className='text-gray-700 mb-4'>{q.question}</p>
              <RadioGroup
                value={answers[qIdx]?.toString()}
                onValueChange={(value) => handleAnswer(qIdx, parseInt(value))}>
                <div className='space-y-3'>
                  {q.options.map((option, oIdx) => (
                    <label
                      key={oIdx}
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        answers[qIdx] === oIdx
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}>
                      <RadioGroupItem
                        value={oIdx.toString()}
                        className='mt-1'
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='mt-6 flex gap-4'>
        <Button
          variant='outline'
          onClick={() => setStage('reading')}
          className='flex-1'>
          Review Passage
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={answers.length !== passage.questions.length || isSaving}
          className='flex-1'>
          {isSaving ? (
            <>
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              Saving...
            </>
          ) : (
            'Submit Answers'
          )}
        </Button>
      </div>
    </motion.div>
  )

  const renderResults = () => {
    const timeInMinutes = (endTime - startTime) / 1000 / 60
    const wordCount = passage.text.split(' ').length
    const wpm = Math.round(wordCount / timeInMinutes)
    const correctAnswers = answers.filter(
      (answer, idx) => answer === passage.questions[idx].correctIndex,
    ).length
    const comprehension = Math.round(
      (correctAnswers / passage.questions.length) * 100,
    )
    const improvement = wpm - userProfile.baseline_wpm!

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        className='max-w-2xl mx-auto text-center'>
        <CheckCircle2 className='w-16 h-16 text-green-500 mx-auto mb-4' />
        <h2 className='mb-2 text-indigo-900'>Exercise Complete!</h2>
        <p className='text-gray-600 mb-8'>Great job! Here are your results</p>

        <div className='grid md:grid-cols-2 gap-6 mb-8'>
          <Card>
            <CardContent className='pt-6'>
              <TrendingUp className='w-8 h-8 text-indigo-600 mx-auto mb-2' />
              <div className='text-4xl mb-2 text-indigo-600'>{wpm}</div>
              <div className='text-gray-600 mb-2'>Words Per Minute</div>
              {improvement > 0 && (
                <div className='text-sm text-green-600'>
                  +{improvement} from baseline!
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <CheckCircle2 className='w-8 h-8 text-green-600 mx-auto mb-2' />
              <div className='text-4xl mb-2 text-green-600'>
                {comprehension}%
              </div>
              <div className='text-gray-600 mb-2'>Comprehension</div>
              <div className='text-sm text-gray-600'>
                {correctAnswers}/{passage.questions.length} correct
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className='mb-6 bg-linear-to-r from-indigo-50 to-purple-50 border-indigo-200'>
          <CardContent className='pt-6'>
            <h3 className='mb-2 text-indigo-900'>
              XP Earned: +
              {50 +
                (comprehension >= 80 ? 20 : 0) +
                (wpm > userProfile.current_wpm! ? 30 : 0)}
            </h3>
            <p className='text-sm text-gray-700'>
              {comprehension >= 80 && '🎯 Bonus: High comprehension! '}
              {wpm > userProfile.current_wpm! &&
                '⚡ Bonus: New personal best! '}
            </p>
          </CardContent>
        </Card>

        <div className='flex gap-4'>
          <Button variant='outline' onClick={onExit} className='flex-1'>
            Back to Dashboard
          </Button>
          <Button onClick={onComplete} className='flex-1'>
            Continue Practice
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-50 to-blue-50 p-6 py-12'>
      <AnimatePresence mode='wait'>
        {stage === 'reading' && renderReading()}
        {stage === 'questions' && renderQuestions()}
        {stage === 'results' && renderResults()}
      </AnimatePresence>
    </div>
  )
}
