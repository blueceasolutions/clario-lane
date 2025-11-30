import { Card, CardContent, CardHeader, CardTitle } from '@/components'
import { Target, CheckCircle2 } from 'lucide-react'

type MilestoneItem = {
  id: number
  title: string
  date: string
  completed: boolean
}

type Props = {
  milestones: MilestoneItem[]
}

export const MilestonesCard = ({ milestones }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Target className='w-5 h-5 text-indigo-600 dark:text-indigo-400' />
          Milestones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {milestones.map((milestone, idx) => (
            <div key={milestone.id} className='flex items-start gap-3'>
              <div className='relative'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    milestone.completed
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                  {milestone.completed ? (
                    <CheckCircle2 className='w-4 h-4 text-white' />
                  ) : (
                    <span className='text-gray-500 dark:text-gray-400 text-sm'>
                      {idx + 1}
                    </span>
                  )}
                </div>
                {idx < milestones.length - 1 && (
                  <div
                    className={`absolute left-1/2 top-8 w-0.5 h-6 -translate-x-1/2 ${
                      milestone.completed
                        ? 'bg-green-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
              <div className='flex-1 pb-6'>
                <h3
                  className={`mb-1 font-medium ${
                    milestone.completed
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                  {milestone.title}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {milestone.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
