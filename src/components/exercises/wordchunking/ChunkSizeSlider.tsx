import { Slider } from '@/components'
import { usePracticeStore } from '@/store'

export function ChunkSizeSlider() {
  const chunkSize = usePracticeStore((state) => state.chunkSize)
  const isPlaying = usePracticeStore((state) => state.isPlaying)
  const setChunkSize = usePracticeStore((state) => state.setChunkSize)

  return (
    <div className='space-y-2 bg-card border border-border p-4 rounded-lg'>
      <div className='flex justify-between items-center'>
        <label className='text-sm font-medium'>Words Per Chunk</label>
        <span className='text-sm tabular-nums'>{chunkSize} words</span>
      </div>
      <Slider
        value={[chunkSize]}
        onValueChange={(value) => setChunkSize(value[0])}
        min={1}
        max={15}
        step={1}
        disabled={isPlaying}
        className='w-full'
      />
      <div className='flex justify-between text-xs text-muted-foreground'>
        <span>1 word</span>
        <span>15 words</span>
      </div>
    </div>
  )
}
