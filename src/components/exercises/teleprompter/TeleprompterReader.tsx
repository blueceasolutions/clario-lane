import { SpeedReadingPending } from '@/components'
import { useTeleprompterReader } from './useTeleprompterReader'
import { useSyncDisplaySettings, ExerciseControls } from '../shared'
import { ScrollingTextDisplay } from './ScrollingTextDisplay'
import { usePracticeStore } from '@/store'

export function TeleprompterReader() {
  useSyncDisplaySettings()
  useTeleprompterReader({})

  const loading = usePracticeStore((state) => state.loading)

  if (loading) {
    return <SpeedReadingPending />
  }

  return (
    <div className='w-full mx-auto space-y-6'>
      <div className='flex gap-6 h-[58vh] lg:h-[60vh]'>
        <ScrollingTextDisplay />
      </div>
      <div className='fixed bottom-6 right-4 left-4 flex items-center justify-center z-50'>
        <ExerciseControls />
      </div>
    </div>
  )
}
