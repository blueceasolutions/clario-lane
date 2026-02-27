import { Button } from '@/components'
import type { ReactNode } from 'react'

/**
 * Single Responsibility: Render CTA button
 * Open/Closed: Extensible via variants and icons
 * Dependency Inversion: Accepts handler, doesn't know about routing
 */
interface CTAButtonProps {
  readonly label: string
  readonly onClick: () => void
  readonly variant?: 'primary' | 'secondary'
  readonly icon?: ReactNode
  readonly size?: 'default' | 'sm' | 'lg' | 'xl'
  readonly className?: string
}

export function CTAButton({
  label,
  onClick,
  variant = 'primary',
  icon,
  size = 'xl',
  className = '',
}: CTAButtonProps) {
  const baseClassName =
    variant === 'primary'
      ? 'h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all'
      : 'h-14 px-8 text-lg rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80'

  return (
    <Button
      onClick={onClick}
      variant={variant === 'primary' ? 'default' : 'outline'}
      size={size}
      className={`${baseClassName} ${className}`}>
      {label}
      {icon && <span className='ml-2'>{icon}</span>}
    </Button>
  )
}
