import { SpeedReadingPending } from '@/components'
import { useRSVPReader, type RSVPReaderProps } from './useRSVPReader'
import { ExerciseControls, useSyncDisplaySettings } from '../../shared'
import { usePracticeStore } from '@/store'
import { RSVPDisplay } from './RSVPDisplay'

export function RSVPReader({ onPause }: RSVPReaderProps) {
  useSyncDisplaySettings()
  useRSVPReader({ onPause })

  const loading = usePracticeStore((state) => state.loading)

  if (loading) {
    return <SpeedReadingPending />
  }

  return (
    <div className='relative w-full mx-auto'>
      {/* Main Display Card */}
      <RSVPDisplay />

      <div className='fixed bottom-6 right-4 left-4 flex items-center justify-center z-50'>
        <ExerciseControls />
      </div>
    </div>
  )
}
