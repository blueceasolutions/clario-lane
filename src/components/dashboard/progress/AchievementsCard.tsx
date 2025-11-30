import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components'
import { Award } from 'lucide-react'

type BadgeItem = {
  id: string
  name: string
  icon: string
  earned: boolean
  description: string
}

type Props = {
  badges: BadgeItem[]
}

export const AchievementsCard = ({ badges }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Award className='w-5 h-5 text-yellow-600 dark:text-yellow-400' />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-3'>
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-lg border-2 text-center ${
                badge.earned
                  ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900'
                  : 'bg-gray-50 border-gray-200 opacity-60 dark:bg-gray-800 dark:border-gray-700'
              }`}>
              <div className='text-3xl mb-2'>{badge.icon}</div>
              <h3 className='text-sm mb-1 font-medium'>{badge.name}</h3>
              <p className='text-xs text-muted-foreground'>
                {badge.description}
              </p>
              {badge.earned && (
                <Badge className='mt-2 bg-yellow-500 text-white text-xs hover:bg-yellow-600'>
                  Earned
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
