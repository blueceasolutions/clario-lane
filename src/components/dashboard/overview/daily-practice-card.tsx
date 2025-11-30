import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components'
import { Zap } from 'lucide-react'
import { TaskItem } from './task-item'

type Props = {
  todaysTasks: {
    id: number
    title: string
    completed: boolean
    xp: number
  }[]
}

export const DailyPracticeCard = ({ todaysTasks }: Props) => {
  return (
    <Card
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}>
      <CardHeader>
        <CardTitle>Today's Practice Plan</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {todaysTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
        <Button className='w-full mt-4'>
          <Zap className='w-4 h-4 mr-2' />
          Start Practice Session
        </Button>
      </CardContent>
    </Card>
  )
}
