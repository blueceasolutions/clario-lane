import { usePracticeStore } from '@/store'
import { Button } from '@/components/ui'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { ReaderProgressHeader } from './ReaderProgressHeader'
import { CustomProgress, ControlPanel } from '.'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function ExerciseControls() {
  const words = usePracticeStore((state) => state.words)
  const currentIndex = usePracticeStore((state) => state.currentIndex)
  const isPlaying = usePracticeStore((state) => state.isPlaying)
  const progress = usePracticeStore((state) => state.progress)

  const handlePlayPause = usePracticeStore((state) => state.handlePlayPause)
  const handleReset = usePracticeStore((state) => state.handleReset)
  const handleComplete = usePracticeStore((state) => state.handleComplete)

  const canComplete = currentIndex >= words.length
  const canReset = currentIndex > 0
  const shouldShowComplete = progress >= 100
  const shouldAllowReset = canReset || progress > 0

  return (
    <div className='flex items-center flex-wrap gap-4 bg-card border border-border p-4 md:px-8 rounded-xl shadow-lg shadow-primary/10 '>
      <ReaderProgressHeader />

      {/* Progress Bar */}
      <CustomProgress progress={progress} />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleReset}
            className='rounded-full'
            variant='outline'
            size='lg'
            disabled={!shouldAllowReset}>
            <RotateCcw className='h-4 w-4' />
          </Button>
        </TooltipTrigger>
        <TooltipContent className='p-1.5'>
          <span>Reset</span>
        </TooltipContent>
      </Tooltip>

      <div className='flex-1 flex justify-center '>
        {!shouldShowComplete ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handlePlayPause}
                className='rounded-full'
                disabled={progress >= 100 && !isPlaying}
                size='lg'>
                {isPlaying ? (
                  <>
                    <Pause size={24} /> Pause
                  </>
                ) : (
                  <>
                    <Play size={24} /> Play
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent className='p-1.5'>
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleComplete}
                variant='default'
                size='lg'
                className='rounded-full'>
                Continue to Quiz
              </Button>
            </TooltipTrigger>
            <TooltipContent className='p-1.5'>
              <span>Continue to Quiz</span>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <ControlPanel
        onTriggerClick={isPlaying ? handlePlayPause : () => {}}
        canComplete={canComplete}
        canReset={canReset}
      />
    </div>
  )
}
