import { Skeleton } from '@/components'

export const SpeedReadingPending = () => {
  return (
    <div className='flex flex-col gap-3 mx-auto'>
      <Skeleton className='flex-3 w-full' />
      <Skeleton className='flex-1 w-full' />
    </div>
  )
}
