import type { Quest, UserQuest } from '@/types'
import { useQuestProgress } from '@/hooks/useQuestProgress'
import { getQuestItemStyles } from '@/lib/utils/quest.styles'
import { QuestHeader } from './QuestHeader'
import { QuestProgress } from './QuestProgress'
import { QuestReward } from './QuestReward'
import { QuestExpiry } from './QuestExpiry'

type QuestItemProps = {
  quest: Quest
  progress?: UserQuest
  onClaim?: (questId: string) => void
}

export function QuestItem({ quest, progress, onClaim }: QuestItemProps) {
  const { currentValue, progressPercent, isCompleted, isClaimed } =
    useQuestProgress(quest, progress)

  const handleClaim = () => {
    if (onClaim) {
      onClaim(quest.id)
    }
  }

  return (
    <div className={getQuestItemStyles(isCompleted, isClaimed)}>
      <QuestHeader
        type={quest.type}
        isCompleted={isCompleted}
        isClaimed={isClaimed}
      />

      <p className='text-sm font-medium text-gray-900 dark:text-gray-100 mb-3'>
        {quest.description}
      </p>

      <QuestProgress
        currentValue={currentValue}
        targetValue={quest.target_value}
        metric={quest.target_metric}
        progressPercent={progressPercent}
      />

      <QuestReward
        xpReward={quest.xp_reward}
        isCompleted={isCompleted}
        isClaimed={isClaimed}
        onClaim={handleClaim}
      />

      {(progress?.expires_at || quest.expires_at) && !isCompleted && (
        <QuestExpiry expiresAt={progress?.expires_at || quest.expires_at!} />
      )}
    </div>
  )
}
