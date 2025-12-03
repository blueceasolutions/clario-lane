import { Badge, Button, Card, CardContent } from '@/components'
import {
  PRACTICE_COLORS,
  PRACTICE_ICONS,
  PRACTICE_ROUTES,
  type Practice,
} from '@/lib'
import { useAppStore } from '@/store'
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
  const handleClick = useCallback(
    () => setActivePractice(practice),
    [practice, setActivePractice]
  )

  return (
    <Card
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay! / 5 || 0.1 }}>
      <CardContent>
        <div className='space-y-4'>
          <div className={`p-1 rounded-lg `}>
            <Icon className={`w-6 h-6 text-${color}-500`} />
          </div>
          <div>
            <h3 className='mb-1'>{practice.title}</h3>
            <p className='text-sm  mb-3'>{practice.description}</p>
            <div className='flex items-center gap-3 mb-3'>
              {practice.difficulty && (
                <Badge variant='secondary' className='text-xs capitalize'>
                  {practice.difficulty}
                </Badge>
              )}
              {practice.xp && (
                <span className='text-sm text-primary'>+{practice.xp} XP</span>
              )}
            </div>
            <Button
              asChild
              onClick={handleClick}
              size='sm'
              variant='outline'
              className={`w-full font-semibold `}>
              <Link to={`${route}/${practice.id}` as any}>Start</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
