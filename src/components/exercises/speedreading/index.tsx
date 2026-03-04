import { usePracticeStore } from '../../../store/practice/practiceStore'
import { RSVPReader } from './RSVPReader'
import { ComprehensionQuiz, IntroStep, Results } from '../shared'
import { PracticeStep } from '@/lib'
import type { ReactNode } from 'react'

export const SpeedReadingTraining = () => {
  const { currentStep, setStep } = usePracticeStore()

  const steps: Record<PracticeStep, ReactNode> = {
    Intro: (
      <IntroStep
        title='Speed Reading Training'
        onContinue={() => setStep(PracticeStep.enum.Reading)}>
        <p>
          Focus on the space in between the vertical{' '}
          <span className=' px-3 py-0.5 rounded-full text-primary-foreground bg-primary'>
            lines
          </span>{' '}
          on center of the screen. Words will appear one at a time. Try to
          minimize subvocalization.
        </p>
      </IntroStep>
    ),
    Reading: <RSVPReader />,
    Quiz: <ComprehensionQuiz />,
    Results: <Results />,
  }

  return <div>{steps[currentStep]}</div>
}
