import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Switch,
} from '@/components/ui'
import { useState } from 'react'

export function SettingsPage() {
  const [dailyReminder, setDailyReminder] = useState(true)
  const [weeklySummary, setWeeklySummary] = useState(true)

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Settings</h2>
        <p className='text-muted-foreground'>
          Manage your account settings and preferences.
        </p>
      </div>

      <div className='grid gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>
              Manage your subscription and billing information.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between rounded-lg border p-4'>
              <div className='space-y-0.5'>
                <div className='font-medium'>Active Plan</div>
                <div className='text-sm text-muted-foreground'>
                  You are currently on the active plan.
                </div>
              </div>
              <Button variant='outline'>Cancel Subscription</Button>
            </div>
          </CardContent>
        </Card>

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
      </div>
    </div>
  )
}
