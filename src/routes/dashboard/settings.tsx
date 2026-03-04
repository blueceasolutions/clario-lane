import { SettingsPage, SettingsPending } from '@/components'
import { createFileRoute } from '@tanstack/react-router'

import { SeoHead } from '@/components/shared'

export const Route = createFileRoute('/dashboard/settings')({
  component: RouteComponent,
  pendingComponent: SettingsPending,
})

function RouteComponent() {
  return (
    <>
      <SeoHead
        title='Settings'
        description='Manage your account and preferences.'
      />
      <SettingsPage />
    </>
  )
}
