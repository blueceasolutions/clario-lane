import { Play, Pause, RotateCcw } from 'lucide-react'
import { Button, Slider } from '@/components'
import { SpeedReadingPending } from '../speed-reading-pending'
import { useRSVPReader, type RSVPReaderProps } from './useRSVPReader'

export function RSVPReader({ onPause }: RSVPReaderProps) {
  const {
    progress,
    handleComplete,
    handlePlayPause,
    handleReset,
    words,
    currentIndex,
    isPlaying,
    wpm,
    loading,
    setWpm,
    formatTime,
    elapsedTime,
  } = useRSVPReader({ onPause })

  if (loading) {
    return <SpeedReadingPending />
  }

  return (
    <div className='w-full max-w-3xl mx-auto space-y-6'>
      {/* Word Display */}
      <div className='bg-card border border-border rounded-lg p-12 min-h-[240px] flex items-center justify-center'>
        <div className='text-center'>
          {words.length > 0 && currentIndex < words.length ? (
            <span className='text-5xl'>{words[currentIndex]}</span>
          ) : words.length > 0 ? (
            <span className='text-3xl text-muted-foreground'>Complete!</span>
          ) : (
            <span className='text-2xl text-muted-foreground'>Loading...</span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className='w-full bg-secondary rounded-full h-2'>
        <div
          className='bg-primary h-2 rounded-full transition-all duration-200'
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className='flex items-center gap-4'>
        <Button
          onClick={handlePlayPause}
          disabled={currentIndex >= words.length}
          size='lg'>
          {isPlaying ? (
            <>
              <Pause className='mr-2 h-4 w-4' />
              Pause
            </>
          ) : (
            <>
              <Play className='mr-2 h-4 w-4' />
              {currentIndex > 0 ? 'Resume' : 'Start'}
            </>
          )}
        </Button>

        <Button
          onClick={handleReset}
          variant='outline'
          size='lg'
          disabled={currentIndex === 0}>
          <RotateCcw className='mr-2 h-4 w-4' />
          Reset
        </Button>

        <div className='flex-1' />

        {currentIndex >= words.length && (
          <Button onClick={handleComplete} variant='default' size='lg'>
            Continue to Quiz
          </Button>
        )}

        {currentIndex < words.length && <div className='flex-1' />}

        <div className='text-right space-y-1'>
          <div className='text-sm text-muted-foreground'>Time</div>
          <div className='text-2xl tabular-nums'>{formatTime(elapsedTime)}</div>
        </div>

        <div className='text-right space-y-1'>
          <div className='text-sm text-muted-foreground'>Progress</div>
          <div className='text-2xl tabular-nums'>
            {currentIndex} / {words.length}
          </div>
        </div>
      </div>

      {/* WPM Slider */}
      <div className='space-y-2'>
        <div className='flex justify-between items-center'>
          <label className='text-sm'>Reading Speed</label>
          <span className='text-sm tabular-nums'>{wpm} WPM</span>
        </div>
        <Slider
          value={[wpm]}
          onValueChange={(value) => setWpm(value[0])}
          min={100}
          max={1000}
          step={10}
          disabled={isPlaying}
          className='w-full'
        />
        <div className='flex justify-between text-xs text-muted-foreground'>
          <span>100 WPM</span>
          <span>1000 WPM</span>
        </div>
      </div>
    </div>
  )
}
