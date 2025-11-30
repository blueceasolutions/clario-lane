import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui'
import { cancelSubscriptionMutation } from '@/integration/mutations/subscriptionMutation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export function SubscriptionCard() {
  const { mutate, isPending } = useMutation({
    ...cancelSubscriptionMutation,
    onSuccess: () => {
      toast.success('Subscription cancelled successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel subscription')
    },
  })

  return (
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
          <Button
            variant='outline'
            onClick={() => mutate()}
            disabled={isPending}>
            {isPending ? 'Cancelling...' : 'Cancel Subscription'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
