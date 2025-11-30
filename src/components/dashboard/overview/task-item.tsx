import { CheckCircle2 } from 'lucide-react'

type TaskItemProps = {
  task: {
    id: number
    title: string
    completed: boolean
    xp: number
  }
}

export const TaskItem = ({ task }: TaskItemProps) => {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border-2 ${
        task.completed
          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900'
          : 'bg-white border-gray-200 dark:bg-card dark:border-border'
      }`}>
      <div className='flex items-center gap-3'>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            task.completed
              ? 'bg-green-500 border-green-500 dark:bg-green-600 dark:border-green-600'
              : 'border-gray-300 dark:border-gray-600'
          }`}>
          {task.completed && <CheckCircle2 className='w-3 h-3 text-white' />}
        </div>
        <span
          className={
            task.completed
              ? 'line-through text-gray-500 dark:text-gray-400'
              : 'text-gray-900 dark:text-gray-100'
          }>
          {task.title}
        </span>
      </div>
      <span className='text-sm text-indigo-600 dark:text-indigo-400'>
        +{task.xp} XP
      </span>
    </div>
  )
}
