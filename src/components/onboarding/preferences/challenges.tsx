import { BookOpen, FileText, Focus, Sparkles } from 'lucide-react'
import { OptionCard, StepContainer } from '@/components'

import type { ChallengesType, PreferencesType } from '@/types'
import type { ReactNode } from 'react'
import { getIcon } from './getIcon'

type Props = {
  selections: string[]
  challenges: ChallengesType[]
  toggleSelection: (category: PreferencesType, value: string) => void
}

type challenges = 'speed' | 'comprehension' | 'focus' | 'retention'

const Icons: Record<challenges, ReactNode> = {
  speed: <Sparkles className='w-6 h-6' />,
  comprehension: <BookOpen className='w-6 h-6' />,
  focus: <Focus className='w-6 h-6' />,
  retention: <FileText className='w-6 h-6' />,
}

export function Challenges({ selections, toggleSelection, challenges }: Props) {
  return (
    <StepContainer key='step-2'>
      <h3 className='mb-6 text-lg font-semibold text-center'>
        What challenges do you face?
      </h3>
      <div className='grid sm:grid-cols-2 gap-4'>
        {challenges.map(({ challenge, id, description }) => (
          <OptionCard
            key={id}
            icon={getIcon(Icons, challenge.toLowerCase() as challenges)}
            title={challenge}
            description={description}
            selected={selections.includes(challenge)}
            onClick={() => toggleSelection('challenges', challenge)}
          />
        ))}
      </div>
    </StepContainer>
  )
}
