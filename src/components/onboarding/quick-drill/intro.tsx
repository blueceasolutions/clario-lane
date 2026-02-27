import { motion } from 'motion/react'
import { CheckCircle2, Clock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StepCard } from '../layout'

type Props = {
  handleStartDrill: () => void
}

export function QuickDrillIntro({ handleStartDrill }: Props) {
  return (
    <>
      <StepCard
        title='Quick Focus Drill'
        description='Before we begin, let’s test your current reading speed with short bursts of text.'>
        <div className='grid sm:grid-cols-3 gap-4 mb-8'>
          {[
            {
              icon: Clock,
              title: '2 Minutes',
              desc: 'Short & Focused',
              color: 'text-blue-500',
              bg: 'bg-blue-500/10',
            },
            {
              icon: Zap,
              title: 'Speed Test',
              desc: 'Measure WPM',
              color: 'text-amber-500',
              bg: 'bg-amber-500/10',
            },
            {
              icon: CheckCircle2,
              title: 'Simple Text',
              desc: 'Easy to Read',
              color: 'text-green-500',
              bg: 'bg-green-500/10',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.2 }}
              className='p-4 rounded-xl border border-border/50 bg-secondary/20 flex flex-col items-center text-center gap-3'>
              <div
                className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div>
                <h3 className='font-semibold mb-1'>{item.title}</h3>
                <p className='text-xs text-muted-foreground'>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className='hidden md:flex justify-center'>
          <Button size='xl' onClick={handleStartDrill} className='w-full'>
            Start Drill
          </Button>
        </div>
      </StepCard>

      <div className='md:hidden w-full fixed bottom-0 left-0 right-0 z-50 md:relative md:bottom-auto md:left-auto md:right-auto bg-gradient-to-t from-background/50 via-background/5 to-transparent backdrop-blur-sm'>
        <div className='py-4 px-4 pt-6 md:p-0'>
          <Button size='xl' onClick={handleStartDrill} className='w-full'>
            Start Drill
          </Button>
        </div>
      </div>
    </>
  )
}
