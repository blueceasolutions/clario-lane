import { Skeleton } from '.'

export function SettingsPending() {
  return (
    <div className='max-w-lg mx-auto space-y-8 p-4 md:p-8'>
      <div className='space-y-2'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-4 w-96' />
      </div>

      <div className='space-y-6'>
        <Skeleton className='h-64 w-full rounded-xl' />
        <Skeleton className='h-48 w-full rounded-xl' />
        <Skeleton className='h-48 w-full rounded-xl' />
      </div>
    </div>
  )
}
