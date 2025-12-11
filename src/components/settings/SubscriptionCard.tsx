import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui'

import { enableOrDisableSubscriptionToggleMutation } from '@/integration/mutations/subscriptionMutation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Link } from '@tanstack/react-router'
import { supabaseService } from '~supabase/clientServices'

export function SubscriptionCard() {
  const { data: user, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: async () => await supabaseService.getUser(),
  })

  const { mutate, isPending } = useMutation({
    ...enableOrDisableSubscriptionToggleMutation,
    onSuccess: () => {
      toast.success('Subscription toggled successfully')
      refetch()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to toggle subscription')
    },
  })

  const isSubscribed = user?.is_subscribed

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Plan</CardTitle>
        <CardDescription>
          Manage your subscription and billing information.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {isPending ? (
          <div className='bg-muted h-20 w-full animate-pulse rounded-lg' />
        ) : (
          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div className='space-y-0.5'>
              <div className='font-medium'>
                {isSubscribed ? 'Active Plan' : 'Free Tier / Cancelled'}
              </div>
              <div className='text-sm text-muted-foreground'>
                {isSubscribed
                  ? 'You are currently on the active plan.'
                  : 'Your subscription is not active.'}
              </div>
            </div>
            {isSubscribed ? (
              <Button
                variant='outline'
                onClick={() => mutate('disable')}
                disabled={isPending}>
                {isPending ? 'Cancelling...' : 'Cancel Subscription'}
              </Button>
            ) : (
              <Button asChild disabled={isPending}>
                <Link to='/pricing'>Upgrade Plan</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
