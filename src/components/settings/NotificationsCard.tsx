import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Switch,
} from '@/components/ui'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabaseService } from '~supabase/clientServices'
import { useRouteContext } from '@tanstack/react-router'

export function NotificationsCard() {
  const userProfile = useRouteContext({ from: '__root__' }).user
  const queryClient = useQueryClient()

  // Fetch current notification settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['notification-settings', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return null
      const { data, error } = await supabaseService.sp
        .from('users')
        .select('daily_reminder, reminder_time, weekly_summary')
        .eq('id', userProfile.id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!userProfile?.id,
  })

  // Mutation to update settings
  const updateMutation = useMutation({
    mutationFn: async (
      updates: Partial<{
        daily_reminder: boolean
        reminder_time: string
        weekly_summary: boolean
      }>,
    ) => {
      if (!userProfile?.id) throw new Error('No user ID')

      const { error } = await supabaseService.sp
        .from('users')
        .update(updates)
        .eq('id', userProfile.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] })
      queryClient.invalidateQueries({ queryKey: ['user_profile'] })
    },
  })

  if (isLoading || !settings) {
    return (
      <Card className='bg-transparent border-0 md:bg-card md:border'>
        <CardHeader className='p-0 md:px-6'>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure how you receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className='p-0 md:px-6'>
          <div className='animate-pulse space-y-4'>
            <div className='h-12 bg-gray-200 dark:bg-gray-700 rounded'></div>
            <div className='h-12 bg-gray-200 dark:bg-gray-700 rounded'></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='bg-transparent border-0 shadow-none md:shadow-sm md:bg-card md:border'>
      <CardHeader className='p-0 md:px-6'>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Configure how you receive notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-5 p-0 md:px-6'>
        <div className='flex items-center justify-between space-x-2'>
          <Label
            htmlFor='daily-reminder'
            className='space-y-0.5 items-start flex flex-col'>
            <span>Daily Reminders</span>
            <span className='font-normal text-sm text-muted-foreground'>
              Receive a daily reminder to practice.
            </span>
          </Label>
          <Switch
            id='daily-reminder'
            checked={settings.daily_reminder ?? true}
            onCheckedChange={(checked) =>
              updateMutation.mutate({ daily_reminder: checked })
            }
          />
        </div>

        {/* Reminder Time Picker */}
        {settings.daily_reminder && (
          <div className='flex flex-col gap-2 border-t pt-3'>
            <Label htmlFor='reminder-time' className='text-sm'>
              Reminder Time
            </Label>
            <Input
              id='reminder-time'
              type='time'
              value={settings.reminder_time ?? '09:00:00'}
              onChange={(e) =>
                updateMutation.mutate({ reminder_time: e.target.value })
              }
            />
          </div>
        )}

        <div className='flex items-center justify-between space-x-2 border-t pt-4'>
          <Label
            htmlFor='weekly-summary'
            className='space-y-0.5 items-start flex flex-col'>
            <span className='block'>Weekly Summary</span>
            <span className='font-normal text-sm text-muted-foreground'>
              Get a weekly summary of your progress.
            </span>
          </Label>
          <Switch
            id='weekly-summary'
            checked={settings.weekly_summary ?? true}
            onCheckedChange={(checked) =>
              updateMutation.mutate({ weekly_summary: checked })
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
