import { Card, CardContent } from '@/components'
import {
  PRACTICE_COLORS,
  PRACTICE_ICONS,
  PRACTICE_ROUTES,
  type Practice,
} from '@/lib'
import { useAppStore, usePracticeStore } from '@/store'
import { Link } from '@tanstack/react-router'
import { useCallback } from 'react'

type StartPracticeCardProps = {
  delay?: number
  practice: Practice
}

export const StartPracticeCard = ({
  delay,
  practice,
}: StartPracticeCardProps) => {
  const id = practice.exercise
  const Icon = PRACTICE_ICONS[id]
  const color = PRACTICE_COLORS[id]
  const route = PRACTICE_ROUTES[id]
  const { setActivePractice } = useAppStore()
  const { setExerciseType } = usePracticeStore()

  const handleClick = useCallback(() => {
    setActivePractice(practice)
    setExerciseType(id)
  }, [practice, setActivePractice])

  return (
    <Link
      to={`${route}/${practice.id}` as any}
      onClick={handleClick}
      className='block group'>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: delay! / 5 || 0.1 }}
        className='h-full border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-card/50 rounded-[2rem] overflow-hidden'>
        <CardContent className='p-8 flex flex-col items-start h-full'>
          {/* Icon Container */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-${color}-100 dark:bg-${color}-500/20 text-${color}-600 dark:text-${color}-400 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className='w-7 h-7' />
          </div>

          {/* Content */}
          <div className='space-y-3'>
            <h3 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-primary transition-colors'>
              {practice.title}
            </h3>

            <p className='text-muted-foreground leading-relaxed text-base'>
              {practice.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
