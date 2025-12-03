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
    onSuccess: () => {
      setFeedback('')
      setCategory('general')
      onOpenChange(false)
      // Optional: Show success toast
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onChange={(e) => setFeedback(e.target.value)}
              className='min-h-[150px]'
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}>
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
