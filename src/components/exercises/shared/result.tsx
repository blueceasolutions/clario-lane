import { Button, Card, ConfettiComponent } from '@/components'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { useRouter } from '@tanstack/react-router'
import { usePracticeStore } from '@/store'
import { fetchPassage } from '@/integration'
import { useQuery } from '@tanstack/react-query'

export const Results = () => {
  const { wpm, comprehension, reset, nextWpm, setWpm } = usePracticeStore()
  const route = useRouter()
  const { refetch } = useQuery(fetchPassage)

  const ers = Math.round((wpm * comprehension) / 100)
  const wpmChange = nextWpm ? nextWpm - wpm : 0

  const onComplete = () => {
    route.navigate({ to: '/dashboard' })
    refetch()
    reset()
  }
  const onNext = () => {
    if (nextWpm) {
      setWpm(nextWpm)
    }
    refetch()
    reset()
  }

  return (
    <>
      <div className='w-full max-w-2xl mx-auto'>
        <Card className=' bg-transparent border-none shadow-none md:shadow-lg md:border md:border-border md:bg-card md:p-8 md:space-y-6'>
          <div className='text-center space-y-2'>
            <h2 className='text-3xl'>Session Complete!</h2>
            <p className='text-muted-foreground'>Great work on this session</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 md:py-6'>
            <div className='bg-accent/10 rounded-lg p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-3xl mb-1'>{wpm}</div>
                  <div className='text-sm text-muted-foreground'>
                    Words Per Minute
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-destructive/5 rounded-lg p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-3xl mb-1'>
                    {Math.round(comprehension)}%
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Comprehension
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-primary/10 rounded-lg p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-3xl mb-1'>{ers}</div>
                  <div className='text-sm text-muted-foreground'>
                    Effective Reading Speed
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='border-t pt-6'>
            <div className='flex flex-wrap gap-2 items-center justify-between mb-4'>
              <div>
                <h3 className='text-lg'>Next Session</h3>
                <p className='text-sm text-muted-foreground'>
                  Recommended speed based on your performance
                </p>
              </div>
              <div className='text-right'>
                <div className='text-2xl'>{nextWpm} WPM</div>
                {wpmChange !== 0 && (
                  <div
                    className={`text-sm flex items-center gap-1 ${wpmChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {wpmChange > 0 ? (
                      <>
                        <TrendingUp className='h-4 w-4' />+{wpmChange} WPM
                      </>
                    ) : (
                      <>
                        <TrendingDown className='h-4 w-4' />
                        {wpmChange} WPM
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='flex-wrap flex gap-3'>
            <Button
              size='xl'
              onClick={onComplete}
              variant='outline'
              className='flex-1'>
              View Dashboard
            </Button>
            <Button size='xl' onClick={onNext} className='flex-1'>
              Next Session
            </Button>
          </div>
        </Card>
      </div>

      <ConfettiComponent
        particleCount={comprehension * 6}
        effectCount={Math.round(comprehension / 20)}
      />
    </>
  )
}
