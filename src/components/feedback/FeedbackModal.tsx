import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button, Textarea } from '@/components'
import { Label } from '@/components/ui/label'
import { useMutation } from '@tanstack/react-query'
import { supabaseService } from '~supabase/clientServices'
import { useRouteContext } from '@tanstack/react-router'
import { apiInstance } from '@/integration'
import { FEEDBACK_KEY, FEEDBACK_STATE, TOTAL_SESSIONS_KEY } from '@/lib'
import { toast } from 'sonner'

interface FeedbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState('')
  const [category, setCategory] = useState<'bug' | 'feature' | 'general'>(
    'general'
  )
  const userProfile = useRouteContext({ from: '__root__' }).user

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!userProfile?.id || !feedback.trim()) {
        throw new Error('Missing required fields')
      }

      // You can store feedback in a database table or send to an external service
      const { error } = await supabaseService.sp
        .from('feedback' as any) // Create this table or use your preferred storage
        .insert({
          user_id: userProfile.id,
          category,
          message: feedback,
          created_at: new Date().toISOString(),
        })

      if (error) throw error
    },
    onSuccess: async () => {
      // Send email notification
      try {
        await apiInstance.post('send-email', {
          type: 'FEEDBACK_SUBMITTED',
          email: userProfile?.email || 'user@example.com',
          data: {
            category,
            message: feedback,
          },
        })
      } catch (error) {
        console.error('Failed to send feedback email:', error)
      }

      setFeedback('')
      setCategory('general')
      onOpenChange(false)
      localStorage.setItem(FEEDBACK_KEY, FEEDBACK_STATE.TRUE)
      toast.success('Feedback submitted successfully')
    },
    onError: () => {
      toast.error('Failed to submit feedback')
    },
  })

  const handleClose = () => {
    onOpenChange(false)
    const getHasFeedback = localStorage.getItem(FEEDBACK_KEY)
    const hasFeedback = getHasFeedback === FEEDBACK_STATE.TRUE
    setFeedback('')
    setCategory('general')
    if (hasFeedback) return

    localStorage.setItem(FEEDBACK_KEY, FEEDBACK_STATE.FALSE)
    localStorage.setItem(
      TOTAL_SESSIONS_KEY,
      userProfile?.total_sessions?.toString() || '0'
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[525px]'>
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Help us improve ClarioLane. Share your thoughts, report bugs, or
            suggest new features.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Category Selection */}
          <div className='space-y-2'>
            <Label>Category</Label>
            <div className='flex gap-2'>
              {(['general', 'bug', 'feature'] as const).map((cat) => (
                <Button
                  key={cat}
                  type='button'
                  variant={category === cat ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setCategory(cat)}
                  className='capitalize'>
                  {cat === 'bug' ? '🐛 ' : cat === 'feature' ? '💡 ' : '💬 '}
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div className='space-y-2'>
            <Label htmlFor='feedback'>Your Feedback</Label>
            <Textarea
              id='feedback'
              placeholder='Tell us what you think...'
              value={feedback}
              rows={5}
              onChange={(e) => setFeedback(e.target.value)}
              className='min-h-[150px] max-h-[200px] overflow-y-auto'
            />
          </div>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type='submit'
            onClick={() => submitMutation.mutate()}
            disabled={!feedback.trim() || submitMutation.isPending}>
            {submitMutation.isPending ? 'Sending...' : 'Send Feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
