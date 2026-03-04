type CustomProgressProps = {
  progress: number
}

export function CustomProgress({ progress }: CustomProgressProps) {
  return (
    <div className='w-full bg-secondary rounded-full h-3'>
      <div
        className='bg-linear-to-r from-primary to-primary/50 h-3 rounded-full transition-all duration-200'
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
