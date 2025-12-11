import { SpeedReadingTraining } from '@/components'
import { usePracticeStore } from '@/store'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/dashboard/practice/speedreading/$practiceId'
)({
  component: RouteComponent,
  onLeave: () => usePracticeStore.getState().reset(),
})

function RouteComponent() {
  return <SpeedReadingTraining />
}
