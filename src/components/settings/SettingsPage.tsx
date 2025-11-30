import {
  NotificationsCard,
  ReadingPreferencesCard,
  SettingsLayout,
  SubscriptionCard,
} from './'

export function SettingsPage() {
  return (
    <SettingsLayout>
      <SubscriptionCard />
      <ReadingPreferencesCard />
      <NotificationsCard />
    </SettingsLayout>
  )
}
