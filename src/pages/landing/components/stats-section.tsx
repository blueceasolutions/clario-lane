import { STATISTICS } from '../data'
import { StatisticCard } from './presentational/StatisticCard'

/**
 * Single Responsibility: Layout and section structure only
 * Open/Closed: Adding statistics requires only data changes, not code
 */
export function StatsSection() {
  return (
    <section className='py-20 px-4 bg-[#F5F5F7] dark:bg-black'>
      <div className='container mx-auto max-w-6xl'>
        <div className='grid md:grid-cols-3 gap-12 text-center'>
          {STATISTICS.map((statistic, index) => (
            <StatisticCard key={index} statistic={statistic} />
          ))}
        </div>
      </div>
    </section>
  )
}
