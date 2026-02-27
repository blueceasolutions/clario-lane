import { Skeleton } from '.'

export function AuthPending() {
  return (
    <div className='bg-background min-h-[75svh] p-4 md:p-10 flex items-center justify-center'>
      <div className='w-full max-w-lg space-y-6 mx-auto pt-28 nd:pt-24'>
        <div className='mx-auto w-fit space-y-2'>
          <Skeleton className='h-8 w-32 mx-auto' />
        </div>
        <div className='space-y-4'>
          <Skeleton className='h-12 w-full' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-10 w-full' />
          </div>
          <Skeleton className='h-12 w-full mt-6' />
        </div>
      </div>
    </div>
  )
}
