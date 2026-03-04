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
      <div className='bg-card border border-border rounded-lg p-12 min-h-[240px] h-[calc(70vh-180px)] flex items-center justify-center'>
        <DisplayText className='text-muted-foreground'>Loading...</DisplayText>
      </div>
    )
  }

  if (currentIndex >= words.length) {
    return (
      <div className='bg-card border border-border rounded-lg p-12 min-h-[240px] h-[calc(70vh-180px)] flex items-center justify-center'>
        <DisplayText className='text-muted-foreground'>Complete!</DisplayText>
      </div>
    )
  }

  return (
    <div className='w-full '>
      <div className='md:bg-card md:border md:border-border md:rounded-lg md:p-4 lg:p-12 min-h-[240px] h-[calc(70vh-180px)] flex items-center justify-center relative'>
        <div className='absolute left-1/4 top-0  w-1 h-1/4 bg-primary/50 rounded-full opacity-50 pointer-events-none' />
        <div className='absolute right-1/4 top-0  w-1 h-1/4 bg-primary/50 rounded-full opacity-50 pointer-events-none' />
        <div className='absolute left-1/4 bottom-0  w-1 h-1/4 bg-primary/50 rounded-full opacity-50 pointer-events-none' />
        <div className='absolute right-1/4 bottom-0  w-1 h-1/4 bg-primary/50 rounded-full opacity-50 pointer-events-none' />

        <p className='text-muted-foreground/50 uppercase font-mono lg:text-md text-xs absolute bottom-4 w-full z-20 text-center'>
          Rest your gaze in between the lines
        </p>

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
    </div>
  )
}
