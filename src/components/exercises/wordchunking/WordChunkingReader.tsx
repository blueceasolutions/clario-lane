import { SpeedReadingPending } from '@/components'
import { useWordChunkingReader } from './useWordChunkingReader'
import { useSyncDisplaySettings, ExerciseControls } from '../shared'
import { WordChunkDisplay } from './WordChunkDisplay'
import { usePracticeStore } from '@/store'

export function WordChunkingReader() {
  useSyncDisplaySettings()
  useWordChunkingReader({})

  const loading = usePracticeStore((state) => state.loading)

  if (loading) {
    return <SpeedReadingPending />
  }

  return (
    <div className='w-full mx-auto space-y-6'>
      <WordChunkDisplay />
      <div className='fixed bottom-6 right-4 left-4 flex items-center justify-center z-50'>
        <ExerciseControls />
      </div>
    </div>
  )
}
