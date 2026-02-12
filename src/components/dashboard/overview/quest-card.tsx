import { Card, CardContent, CardHeader, CardTitle } from '@/components'
import { Trophy } from 'lucide-react'
import type { Quest, UserQuest } from '@/types'
import { useActiveQuests } from '@/hooks/useActiveQuests'
import { QuestItem } from './quest-components/QuestItem'

type Props = {
  todaysTasks: {
    all?: Quest[]
    userProgress?: UserQuest[]
    getProgress: (questId: string) => UserQuest | undefined
  }
  onClaimQuest?: (questId: string) => void
}

export const QuestCard = ({ todaysTasks, onClaimQuest }: Props) => {
  const activeQuests = useActiveQuests(
    todaysTasks.all || [],
    todaysTasks.getProgress,
  )

  // Mock empty state for now if needed, but we'll focus on the card interaction
  // if (activeQuests.length === 0) {
  //   return <QuestEmptyState />
  // }

  return (
    <Card className='bg-white dark:bg-zinc-900 border-none shadow-sm h-full'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-base font-medium flex items-center gap-2 text-gray-900 dark:text-white'>
          <Trophy className='w-4 h-4 text-purple-600' />
          Daily Quests
        </CardTitle>
        <span className='px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-semibold rounded-md'>
          {activeQuests.length} Active
        </span>
      </CardHeader>
      <CardContent className='space-y-4'>
        {activeQuests.length > 0 ? (
          activeQuests.map((quest) => {
            const progress = todaysTasks.getProgress(quest.id)
            return (
              <QuestItem
                key={quest.id}
                quest={quest}
                progress={progress}
                onClaim={onClaimQuest}
              />
            )
          })
        ) : (
          <div className='text-center py-8 text-muted-foreground text-sm'>
            All quests completed for today! 🎉
          </div>
        )}
      </CardContent>
    </Card>
  )
}
