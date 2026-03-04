import { usePracticeStore } from '../../../store/practice/practiceStore'
import { WordChunkingReader } from './WordChunkingReader'
import { ComprehensionQuiz, IntroStep, Results } from '../shared'
import { PracticeStep } from '@/lib'
import type { ReactNode } from 'react'

export const WordChunkingTraining = () => {
  const { currentStep, setStep } = usePracticeStore()

  const steps: Record<PracticeStep, ReactNode> = {
    Intro: (
      <IntroStep
        title='Word Chunking Training'
        onContinue={() => setStep(PracticeStep.enum.Reading)}>
        <p>
          Rest your gaze in between the{' '}
          <span className=' px-3 py-0.5 rounded-full text-primary-foreground bg-primary'>
            lines
          </span>{' '}
          in the middle while the rest of the words come into view.
        </p>
      </IntroStep>
    ),
    Reading: <WordChunkingReader />,
    Quiz: <ComprehensionQuiz />,
    Results: <Results />,
  }

  return <div>{steps[currentStep]}</div>
}
