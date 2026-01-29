import { Slider } from '@/components'
import { usePracticeStore } from '@/store'
import { useQuery } from '@tanstack/react-query'
import { useEffect, type ReactNode } from 'react'
import { supabaseService } from '~supabase/clientServices'

type ReaderControlsProps = {
  children?: ReactNode
  canComplete?: boolean
  canReset?: boolean
}

export function ReaderControls({}: ReaderControlsProps) {
  const { isPlaying, wpm, setWpm } = usePracticeStore()

  const { data: userProfile } = useQuery({
    queryKey: ['user_profile'],
    queryFn: () => supabaseService.getUser(),
  })

  const currentWpm = userProfile?.next_wpm || userProfile?.current_wpm || 250

  useEffect(() => {
    if (userProfile) {
      setWpm(currentWpm)
    }
  }, [userProfile])

  return (
    <div className='bg-card p-4 rounded-2xl shadow-lg shadow-primary/10'>
      {/* WPM Slider */}
      <div className='space-y-2 '>
        <div className='flex justify-between items-center'>
          <label className='font-medium'>Reading Speed</label>
          <div className='flex items-center gap-2'>
            <span className='tabular-nums'>{wpm} WPM</span>
          </div>
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
        <div className='flex justify-between text-sm text-muted-foreground'>
          <span>100 WPM</span>
          <span>1000 WPM</span>
        </div>
      </div>
    </div>
  )
}
