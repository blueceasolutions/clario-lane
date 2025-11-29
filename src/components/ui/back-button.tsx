import { useCanGoBack, useRouter, useLocation } from '@tanstack/react-router'
import { Button } from './button'
import { ArrowLeft } from 'lucide-react'

export const BackButton = () => {
  const router = useRouter()
  const location = useLocation()
  const canGoBack = useCanGoBack()

  const isDashboard = location.pathname === '/dashboard'

  const handleGoBack = () => {
    if (canGoBack || isDashboard) {
      router.history.back()
    } else {
      router.navigate({ to: '/' })
    }
  }
  if (!canGoBack || isDashboard) return null
  return (
    <div>
      <Button
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 1 }}
        variant={'ghost'}
        className='text-red-500'
        onClick={handleGoBack}>
        <ArrowLeft className='mr-2 h-4 w-4' />
        <span className='hidden md:inline-block'>Back</span>
      </Button>
    </div>
  )
}
