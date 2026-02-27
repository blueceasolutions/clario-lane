import { Skeleton } from '.'

export function OnboardingPending() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-4 space-y-8'>
      <div className='w-full max-w-2xl space-y-4'>
        <Skeleton className='h-2 w-full rounded-full' />
        <div className='flex justify-between'>
          <Skeleton className='h-4 w-10' />
          <Skeleton className='h-4 w-10' />
        </div>
      </div>

      <div className='w-full max-w-2xl space-y-6'>
        <Skeleton className='h-10 w-3/4' />
        <Skeleton className='h-24 w-full' />
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Skeleton className='h-32 w-full rounded-xl' />
          <Skeleton className='h-32 w-full rounded-xl' />
        </div>
      </div>

      <div className='w-full max-w-2xl flex justify-between'>
        <Skeleton className='h-10 w-24' />
        <Skeleton className='h-10 w-24' />
      </div>
    </div>
  )
}
