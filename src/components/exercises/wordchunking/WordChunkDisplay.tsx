import { usePracticeStore } from '@/store'
import { DisplayText } from '../shared'

export function WordChunkDisplay() {
  const words = usePracticeStore((state) => state.words)
  const currentIndex = usePracticeStore((state) => state.currentIndex)
  const chunkSize = usePracticeStore((state) => state.chunkSize)

  // Get the current chunk of words to display
  const chunkStart = currentIndex
  const chunkEnd = Math.min(words.length, currentIndex + chunkSize)
  const currentChunk = words.slice(chunkStart, chunkEnd)

  if (words.length === 0) {
    return (
      <div className='bg-card border border-border rounded-lg p-12 min-h-[240px] h-[45svh] flex items-center justify-center'>
        <DisplayText className='text-muted-foreground'>Loading...</DisplayText>
      </div>
    )
  }

  if (currentIndex >= words.length) {
    return (
      <div className='bg-card border border-border rounded-lg p-12 min-h-[240px] h-[45svh] flex items-center justify-center'>
        <DisplayText className='text-muted-foreground'>Complete!</DisplayText>
      </div>
    )
  }

  return (
    <div className='bg-card border border-border rounded-lg p-12 min-h-[240px] h-[45svh] flex items-center justify-center relative'>
      <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-full opacity-50 pointer-events-none' />

      <div className='flex items-center gap-4 flex-wrap justify-center max-w-4xl z-10'>
        {currentChunk.map((word, index) => (
          <DisplayText
            key={chunkStart + index}
            className='text-foreground text-2xl transition-all'>
            {word}
          </DisplayText>
        ))}
      </div>
    </div>
  )
}
