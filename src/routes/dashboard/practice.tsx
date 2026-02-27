import { SpeedReadingPending } from '@/components'
import { SeoHead } from '@/components/shared'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/practice')({
  component: RouteComponent,
  pendingComponent: SpeedReadingPending,
})

function RouteComponent() {
  return (
    <div>
      <SeoHead
        title='Practice Arena'
        description='Improve your speed reading skills with interactive exercises.'
      />
      <Outlet />
    </div>
  )
}
