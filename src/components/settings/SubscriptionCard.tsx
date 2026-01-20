import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

import { enableOrDisableSubscriptionToggleMutation } from '@/integration/mutations/subscriptionMutation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Link } from '@tanstack/react-router'
import { supabaseService } from '~supabase/clientServices'
import { fetchNextSubscriptionDate } from '@/integration'
import { useMemo } from 'react'

export function SubscriptionCard() {
  const { data: user, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: async () => await supabaseService.getUser(),
  })

  const { data } = useQuery(fetchNextSubscriptionDate)

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
  const isSubscriptionExpired = useMemo(
    () => new Date(data?.next_subscription_date) < new Date(),
    [data]
  )

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
                {isSubscriptionExpired ? 'Expired' : 'Active'}
              </div>
              <div className='text-sm text-muted-foreground'>
                {isSubscriptionExpired
                  ? 'Your subscription is expired.'
                  : 'Your subscription is active.'}
              </div>
            </div>
            {isSubscribed ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant='outline' disabled={isPending}>
                    {isPending ? 'Cancelling...' : 'Cancel Subscription'}
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-md'>
                  <DialogHeader>
                    <DialogTitle>Cancel Subscription</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel your subscription? You
                      will lose access to premium features at the end of your
                      current billing period.
                    </DialogDescription>
                  </DialogHeader>
                  <div className='flex justify-end space-x-2'>
                    <DialogClose asChild>
                      <Button variant='outline'>Back</Button>
                    </DialogClose>
                    <Button
                      variant='destructive'
                      onClick={() => mutate('disable')}
                      disabled={isPending}>
                      {isPending ? 'Cancelling...' : 'Yes, Cancel Subscription'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
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
