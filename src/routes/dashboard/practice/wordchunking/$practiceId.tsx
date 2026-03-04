import { createFileRoute } from '@tanstack/react-router'
import { WordChunkingTraining } from '@/components/exercises'
import { usePracticeStore } from '@/store'

export const Route = createFileRoute(
  '/dashboard/practice/wordchunking/$practiceId',
)({
  component: WordChunkingPractice,
  onLeave: () => usePracticeStore.getState().reset(),
})

function WordChunkingPractice() {
  return (
    <div className='container mx-auto md:p-6'>
      <WordChunkingTraining />
    </div>
  )
}
