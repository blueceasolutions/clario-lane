import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button, Textarea } from '@/components'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  PRACTICES,
  PRACTICE_ICONS,
  PRACTICE_ROUTES,
} from '@/lib'
import { usePracticeStore, useAppStore } from '@/store'
import { useQuery } from '@tanstack/react-query'
import { fetchPractices } from '@/integration'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

const MIN_WORDS = 30

const MODES: PRACTICES[] = [
  PRACTICES.enum.SPEED_READING,
  PRACTICES.enum.TELEPROMPTER,
  PRACTICES.enum.WORD_CHUNKING,
]

const MODE_LABELS: Record<PRACTICES, string> = {
  SPEED_READING: 'Speed Reading',
  TELEPROMPTER: 'Teleprompter',
  WORD_CHUNKING: 'Word Chunking',
}

interface CustomPassageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomPassageModal({
  open,
  onOpenChange,
}: CustomPassageModalProps) {
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [mode, setMode] = useState<PRACTICES>(PRACTICES.enum.SPEED_READING)

  const { data: practices } = useQuery(fetchPractices)
  const setCustomPassage = usePracticeStore((s) => s.setCustomPassage)
  const setExerciseType = usePracticeStore((s) => s.setExerciseType)
  const setActivePractice = useAppStore((s) => s.setActivePractice)
  const navigate = useNavigate()

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const canSubmit = wordCount >= MIN_WORDS

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setTitle('')
      setText('')
      setMode(PRACTICES.enum.SPEED_READING)
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = () => {
    if (!canSubmit) return

    const practice = practices?.find((p) => p.exercise === mode)
    if (practice) setActivePractice(practice)

    setExerciseType(mode)
    setCustomPassage(text.trim(), title.trim())
    handleClose(false)
    // Route is built from PRACTICE_ROUTES (keyed by the PRACTICES enum) at
    // runtime, so the router's literal-union `to` type can't verify it at
    // compile time -- same load-bearing cast as StartPracticeCard.
    navigate({ to: `${PRACTICE_ROUTES[mode]}/custom` as any })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='w-[95vw] max-w-lg p-0 gap-0 bg-white dark:bg-[#1A1625] border-0 shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden'>
        <div className='p-6 md:p-8 pb-4'>
          <DialogHeader className='space-y-3 text-left'>
            <DialogTitle className='text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white'>
              Practice with your own text
            </DialogTitle>
            <DialogDescription className='text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-normal'>
              Paste an article, an excerpt, or anything you're already
              reading. There's no comprehension quiz for custom text, but it
              still counts toward your stats.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className='p-6 md:p-8 pt-2 space-y-6'>
          {/* Mode Selection */}
          <div className='space-y-3'>
            <Label className='text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider'>
              Practice mode
            </Label>
            <div className='flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide'>
              {MODES.map((m) => {
                const Icon = PRACTICE_ICONS[m]
                const isSelected = mode === m
                return (
                  <button
                    key={m}
                    type='button'
                    onClick={() => setMode(m)}
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
                      {MODE_LABELS[m]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div className='space-y-3'>
            <Label
              htmlFor='custom-title'
              className='text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider'>
              Title (optional)
            </Label>
            <Input
              id='custom-title'
              placeholder='e.g. Chapter 3, or an article name'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Text */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <Label
                htmlFor='custom-text'
                className='text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider'>
                Your text
              </Label>
              <span
                className={cn(
                  'text-xs',
                  canSubmit
                    ? 'text-muted-foreground'
                    : 'text-amber-600 dark:text-amber-400',
                )}>
                {wordCount} word{wordCount === 1 ? '' : 's'}
                {!canSubmit && ` (min ${MIN_WORDS})`}
              </span>
            </div>
            <Textarea
              id='custom-text'
              placeholder='Paste your text here…'
              value={text}
              onChange={(e) => setText(e.target.value)}
              className='min-h-[200px] resize-none p-4 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 text-sm md:text-base focus:ring-purple-500/30 focus:border-purple-500 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600'
            />
          </div>

          {/* Footer Actions */}
          <div className='flex items-center justify-between pt-2'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => handleClose(false)}
              className='text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-transparent px-2 md:px-4'>
              Cancel
            </Button>
            <Button
              type='button'
              size='lg'
              onClick={handleSubmit}
              disabled={!canSubmit}
              className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25 rounded-xl px-6 md:px-8 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base'>
              Start Practicing
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
