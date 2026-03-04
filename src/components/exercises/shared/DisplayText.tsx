import { useDisplaySettingsStore } from '@/store'
import { useAdjustedFontSize } from './useAdjustedFontSize'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type DisplayTextProps = {
  children: ReactNode
  className?: string
}

export function DisplayText({ children, className = '' }: DisplayTextProps) {
  const { fontFamily } = useDisplaySettingsStore()
  const adjustedFontSize = useAdjustedFontSize()

  return (
    <span
      className={cn('text', className)}
      style={{
        fontFamily,
        fontSize: `${adjustedFontSize}em`,
      }}>
      {children}
    </span>
  )
}
