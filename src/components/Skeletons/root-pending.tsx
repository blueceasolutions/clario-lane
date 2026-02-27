import { Spinner } from '../ui/spinner'

export function RootPending() {
  return (
    <div className='min-h-[80svh] w-full flex items-center justify-center bg-background'>
      <div className='flex flex-col items-center gap-4'>
        <Spinner className='size-8 text-primary' />
        <p className='text-muted-foreground text-sm animate-pulse'>
          Loading Clariolane...
        </p>
      </div>
    </div>
  )
}
