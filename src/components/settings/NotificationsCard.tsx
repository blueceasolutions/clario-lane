import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Switch,
} from '@/components/ui'
import { useState } from 'react'

export function NotificationsCard() {
  const [dailyReminder, setDailyReminder] = useState(true)
  const [weeklySummary, setWeeklySummary] = useState(true)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Configure how you receive notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between space-x-2'>
          <Label htmlFor='daily-reminder' className=' space-y-1'>
            <span className=''>Daily Reminders</span>
            <span className='font-normal text-sm text-muted-foreground'>
              Receive a daily reminder to practice.
            </span>
          </Label>
          <Switch
            id='daily-reminder'
            checked={dailyReminder}
            onCheckedChange={setDailyReminder}
          />
        </div>
        <div className='flex items-center justify-between space-x-2'>
          <Label htmlFor='weekly-summary'>
            <span className='block'>Weekly Summary</span>
            <span className='font-normal text-sm text-muted-foreground'>
              Get a weekly summary of your progress.
            </span>
          </Label>
          <Switch
            id='weekly-summary'
            checked={weeklySummary}
            onCheckedChange={setWeeklySummary}
          />
        </div>
      </CardContent>
    </Card>
  )
}
