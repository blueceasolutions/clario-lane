import { Card } from '@/components'
import { DisplayText } from '../shared'
import { usePracticeStore } from '@/store'
import { useRef, useEffect } from 'react'

export function ScrollingTextDisplay() {
  const progress = usePracticeStore((state) => state.progress)
  const text = usePracticeStore((state) => state.passage?.text || '')

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Handle auto-scrolling based on progress
  useEffect(() => {
    console.log({ progress })
    if (scrollContainerRef.current && contentRef.current) {
      const containerHeight = scrollContainerRef.current.clientHeight
      const contentHeight = contentRef.current.clientHeight
      const scrollableDistance = contentHeight - containerHeight

      if (scrollableDistance > 0) {
        const scrollTop = (progress / 100) * scrollableDistance
        scrollContainerRef.current.scrollTop = scrollTop
      }
    }
  }, [progress])

  return (
    <Card className='flex-1 relative overflow-hidden border-border bg-card'>
      {/* Gradient Masks for Fade Effect */}
      <div className='absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none' />
      <div className='absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none' />

      {/* Scrollable Content */}
      <div
        ref={scrollContainerRef}
        className='h-full overflow-y-auto no-scrollbar p-12 scroll-smooth'
        style={{ scrollBehavior: 'smooth' }}>
        <div ref={contentRef} className='py-[40vh]'>
          <DisplayText className='leading-relaxed block text-center'>
            {text}
          </DisplayText>
        </div>
      </div>
    </Card>
  )
}
