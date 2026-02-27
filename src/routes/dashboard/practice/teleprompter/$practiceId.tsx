import { TeleprompterTraining } from '@/components/exercises'
import { usePracticeStore } from '@/store'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/dashboard/practice/teleprompter/$practiceId',
)({
  component: TeleprompterPractice,
  onLeave: () => usePracticeStore.getState().reset(),
})

function TeleprompterPractice() {
  return (
    <div className='container mx-auto lg:p-6'>
      <TeleprompterTraining />
    </div>
  )
}
