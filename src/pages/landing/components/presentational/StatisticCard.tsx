import type { IStatistic } from '../../types'

/**
 * Single Responsibility: Display a single statistic
 * Interface Segregation: Accepts minimal IStatistic interface
 * Pure presentational component
 */
interface StatisticCardProps {
  readonly statistic: IStatistic
}

export function StatisticCard({ statistic }: StatisticCardProps) {
  return (
    <div>
      <div className='text-5xl font-extrabold mb-2 text-[#A855F7] dark:text-purple-400'>
        {statistic.number}
      </div>
      <div className='text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide text-sm'>
        {statistic.label}
      </div>
    </div>
  )
}
