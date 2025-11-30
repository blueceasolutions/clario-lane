import { ComprehensionTraining } from '@/components'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/dashboard/practice/comprehension/$practiceId'
)({
  component: ComprehensionTraining,
})
