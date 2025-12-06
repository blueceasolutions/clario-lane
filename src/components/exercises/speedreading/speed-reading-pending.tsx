import { Skeleton } from '@/components'

export const SpeedReadingPending = () => {
  return (
    <div className='flex flex-col gap-3 mx-auto'>
      <Skeleton className='h-[300px] w-full' />
      <div className='flex justify-between'>
        <Skeleton className='h-[50px] w-[40%]' />
        <Skeleton className='h-[50px] w-[30%]' />
      </div>
      <Skeleton className='h-[30px] w-full' />
    </div>
  )
}
