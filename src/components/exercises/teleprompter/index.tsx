import { usePracticeStore } from '../../../store/practice/practiceStore'
import { TeleprompterReader } from './TeleprompterReader'
import { ComprehensionQuiz, IntroStep, Results } from '../shared'
import { PracticeStep } from '@/lib'
import type { ReactNode } from 'react'

export const TeleprompterTraining = () => {
  const { currentStep, setStep } = usePracticeStore()

  const steps: Record<PracticeStep, ReactNode> = {
    Intro: (
      <IntroStep
        title='Teleprompter Training'
        onContinue={() => setStep(PracticeStep.enum.Reading)}>
        <p>
          Read the text as it scrolls up the screen. Adjust the speed to match
          your reading pace.
        </p>
      </IntroStep>
    ),
    Reading: <TeleprompterReader />,
    Quiz: <ComprehensionQuiz />,
    Results: <Results />,
  }

  return <div>{steps[currentStep]}</div>
}
