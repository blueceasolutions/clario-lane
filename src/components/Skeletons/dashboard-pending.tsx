import { Skeleton } from '.'

export function DashboardPending() {
  return (
    <div className='min-h-[100svh] w-full  flex flex-col'>
      {/* Main Content Skeleton */}
      <div className='flex-1 lg:max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8'>
        {/* Welcome / Header */}
        <div className='space-y-4 max-w-2xl'>
          <Skeleton className='w-48 h-10' />
          <Skeleton className='w-full max-w-lg h-6' />
        </div>

        {/* Widgets Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Main Card (Large) */}
          <div className='md:col-span-2 space-y-4'>
            <Skeleton className='w-full aspect-video rounded-3xl' />
          </div>

          {/* Side Cards */}
          <div className='space-y-6'>
            <Skeleton className='w-full h-48 rounded-3xl' />
            <Skeleton className='w-full h-48 rounded-3xl' />
          </div>
        </div>

        {/* Stats Row */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className='h-32 w-full rounded-2xl' />
          ))}
        </div>
      </div>
    </div>
  )
}
