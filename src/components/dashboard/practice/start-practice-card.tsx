import { Badge, Button, Card, CardContent } from '@/components'
import {
  PRACTICE_COLORS,
  PRACTICE_ICONS,
  PRACTICE_ROUTES,
  type Practice,
} from '@/lib'
import { useAppStore, usePracticeStore } from '@/store'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
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
    <Card
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay! / 5 || 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className='group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300'>
      {/* Subtle gradient overlay */}
      <div className='absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />

      {/* Animated gradient blob */}
      <div className='absolute -right-8 -top-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500' />

      <CardContent className='relative z-10 p-6'>
        <div className='space-y-4'>
          {/* Icon with gradient background */}
          <div className='relative w-fit'>
            <div
              className={`p-3 rounded-xl bg-linear-to-br from-${color}-500/10 to-${color}-600/5 border border-${color}-500/20 group-hover:scale-110 transition-transform duration-300`}>
              <Icon
                className={`w-6 h-6 text-${color}-500 group-hover:text-${color}-600 transition-colors`}
              />
            </div>
          </div>

          <div className='space-y-3'>
            {/* Title with gradient on hover */}
            <h3 className='text-lg font-semibold tracking-tight group-hover:text-primary transition-colors duration-300'>
              {practice.title}
            </h3>

            {/* Description */}
            <p className='text-sm text-muted-foreground leading-relaxed line-clamp-2'>
              {practice.description}
            </p>

            {/* Badges */}
            <div className='flex items-center gap-2 flex-wrap'>
              {practice.difficulty && (
                <Badge
                  variant='secondary'
                  className='text-xs capitalize font-medium px-2.5 py-0.5 bg-secondary/50 backdrop-blur-sm'>
                  {practice.difficulty}
                </Badge>
              )}
              {practice.xp && (
                <div className='flex items-center gap-1 text-sm font-semibold text-primary'>
                  <span className='text-primary/70'>+</span>
                  <span>{practice.xp}</span>
                  <span className='text-xs font-normal text-primary/70'>
                    XP
                  </span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <Button
              asChild
              onClick={handleClick}
              size='lg'
              className='w-full font-semibold group/btn relative overflow-hidden bg-primary/90 hover:bg-primary shadow-sm hover:shadow-md transition-all duration-300'>
              <Link to={`${route}/${practice.id}` as any}>
                <span className='relative z-10 flex items-center justify-center gap-2'>
                  Start Practice
                  <ArrowRight className='w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300' />
                </span>
                {/* Button gradient overlay */}
                <div className='absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700' />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
