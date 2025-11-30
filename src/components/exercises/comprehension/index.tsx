import { usePracticeStore } from '../../../store/practice/practiceStore'
import { ComprehensionReader } from './ComprehensionReader'
import { ComprehensionQuiz, Results } from '../shared'
import { PracticeStep } from '@/lib'
import type { ReactNode } from 'react'

const steps: Record<PracticeStep, ReactNode> = {
  Reading: <ComprehensionReader />,
  Quiz: <ComprehensionQuiz />,
  Results: <Results />,
}

export const ComprehensionTraining = () => {
  const { currentStep } = usePracticeStore()

  return <div>{steps[currentStep]}</div>
}
