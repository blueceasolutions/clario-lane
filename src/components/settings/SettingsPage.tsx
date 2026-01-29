import { Separator } from '../ui'
import {
  NotificationsCard,
  ReadingPreferencesCard,
  SettingsLayout,
  SubscriptionCard,
  PasswordCard,
} from './'

export function SettingsPage() {
  return (
    <SettingsLayout>
      <Separator className='block md:hidden' />
      <SubscriptionCard />
      <Separator className='block md:hidden mb-1' />
      <PasswordCard />
      <Separator className='block md:hidden mb-1' />
      <ReadingPreferencesCard />
      <Separator className='block md:hidden mb-1' />

      <NotificationsCard />
    </SettingsLayout>
  )
}
