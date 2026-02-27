import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button, Textarea } from '@/components'
import { Label } from '@/components/ui/label'
import { useFeedback, type FeedbackCategory } from './useFeedback'
import { MessageSquare, Bug, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeedbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CATEGORIES: { id: FeedbackCategory; label: string; icon: any }[] = [
  { id: 'general', label: 'General', icon: MessageSquare },
  { id: 'bug', label: 'Bug', icon: Bug },
  { id: 'feature', label: 'Feature', icon: Lightbulb },
]

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const {
    feedback,
    setFeedback,
    category,
    setCategory,
    submitMutation,
    handleClose,
  } = useFeedback(onOpenChange)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='w-[95vw] max-w-lg p-0 gap-0 bg-white dark:bg-[#1A1625] border-0 shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden'>
        {/* Header Section */}
        <div className='p-6 md:p-8 pb-4 relative'>
          <DialogHeader className='space-y-3 md:space-y-4 text-left'>
            <DialogTitle className='text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white'>
              Send Feedback
            </DialogTitle>
            <DialogDescription className='text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-normal'>
              Help us improve Clariolane. Share your thoughts, report bugs, or
              suggest new features to make your reading experience better.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className='p-6 md:p-8 pt-2 space-y-6 md:space-y-8'>
          {/* Category Selection */}
          <div className='space-y-3'>
            <Label className='text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider'>
              Category
            </Label>
            <div className='flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide'>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    type='button'
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl border transition-all duration-200 whitespace-nowrap',
                      isSelected
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-sm ring-1 ring-purple-500/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5',
                    )}>
                    <Icon
                      className={cn(
                        'w-4 h-4',
                        isSelected
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-gray-400',
                      )}
                    />
                    <span className='font-medium text-xs md:text-sm'>
                      {cat.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div className='space-y-3'>
            <Label
              htmlFor='feedback'
              className='text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider'>
              Your Feedback
            </Label>
            <div className='relative group'>
              <Textarea
                id='feedback'
                placeholder='Tell us what you think...'
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className='min-h-[120px] md:min-h-[160px] resize-none p-4 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 text-sm md:text-base focus:ring-purple-500/30 focus:border-purple-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600'
              />
              <div className='absolute bottom-3 right-4 text-[10px] md:text-xs text-gray-400 dark:text-gray-600 pointer-events-none hidden sm:block'>
                Markdown supported
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className='flex items-center justify-between pt-2'>
            <Button
              type='button'
              variant='ghost'
              onClick={handleClose}
              className='text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-transparent px-2 md:px-4'>
              Cancel
            </Button>
            <Button
              type='submit'
              size='lg'
              onClick={() => submitMutation.mutate()}
              disabled={!feedback.trim() || submitMutation.isPending}
              className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25 rounded-xl px-6 md:px-8 transition-all hover:translate-y-px active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base'>
              {submitMutation.isPending ? (
                'Sending...'
              ) : (
                <>
                  Send Feedback
                  <span className='ml-2 text-white/60'>➤</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
