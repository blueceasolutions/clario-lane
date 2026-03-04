import type { IFeature } from '../../types'

/**
 * Single Responsibility: Render a single feature card
 * Open/Closed: Supports variants without modification
 * Interface Segregation: Accepts minimal IFeature interface
 */
interface FeatureCardProps {
  readonly feature: IFeature
}

export function FeatureCard({ feature }: FeatureCardProps) {
  if (feature.variant === 'large') {
    return <FeatureCardLarge feature={feature} />
  }

  return <FeatureCardSmall feature={feature} />
}

/**
 * Large variant feature card
 */
/**
 * Large variant feature card
 */
/**
 * Large variant feature card - Center Highlight
 */
function FeatureCardLarge({ feature }: FeatureCardProps) {
  return (
    <div className='relative group overflow-hidden rounded-[2rem] bg-white dark:bg-[#1A1625] border-[3px] border-purple-200 dark:border-purple-800 p-8 flex flex-col justify-between shadow-2xl shadow-purple-500/10 transform scale-105 z-10'>
      <div className='absolute top-6 right-6 text-purple-400'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'>
          <path d='M12 2v4' />
          <path d='m16.2 7.8 2.9-2.9' />
          <path d='M18 12h4' />
          <path d='m16.2 16.2 2.9 2.9' />
          <path d='M12 18v4' />
          <path d='m4.9 19.1 2.9-2.9' />
          <path d='M2 12h4' />
          <path d='m4.9 4.9 2.9 2.9' />
        </svg>
      </div>

      <div className='relative z-10'>
        <div className='p-3 bg-purple-600 w-fit rounded-full mb-6 text-white shadow-lg shadow-purple-500/30'>
          {feature.icon}
        </div>
        <h3 className='text-2xl font-bold mb-3 text-gray-900 dark:text-white tracking-tight'>
          {feature.title}
        </h3>
        <p className='text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium'>
          {feature.description}
        </p>
      </div>

      {/* Progress bar decoration for main card */}
      <div className='relative z-10 mt-8 pt-6 border-t border-purple-100 dark:border-purple-900/50'>
        <div className='flex justify-between mb-2 items-center'>
          <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
            Status
          </span>
          <span className='text-[10px] font-bold text-purple-600 uppercase tracking-widest'>
            Optimizing...
          </span>
        </div>
        <div className='h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden'>
          <div className='h-full bg-purple-600 rounded-full w-[85%] animate-pulse' />
        </div>
      </div>
    </div>
  )
}

/**
 * Small variant feature card
 */
function FeatureCardSmall({ feature }: FeatureCardProps) {
  return (
    <div className='bg-white dark:bg-[#1A1625] rounded-[2rem] p-8 flex flex-col justify-between hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 group'>
      <div className=''>
        <div className='mb-6 p-2.5 bg-purple-50 dark:bg-purple-900/20 w-fit rounded-xl text-purple-600 dark:text-white group-hover:scale-110 transition-transform duration-300'>
          {feature.icon}
        </div>
        <h3 className='text-xl font-bold mb-3 text-gray-900 dark:text-white'>
          {feature.title}
        </h3>
        <p className='text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium'>
          {feature.description}
        </p>
      </div>
    </div>
  )
}
