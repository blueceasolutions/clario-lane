import { useDisplaySettingsStore } from '@/store'
import type { ReactNode } from 'react'

type DisplayTextProps = {
  children: ReactNode
  className?: string
}

export function DisplayText({ children, className = '' }: DisplayTextProps) {
  const { fontFamily, fontSize } = useDisplaySettingsStore()

  return (
    <span
      className={className}
      style={{
        fontFamily,
        fontSize: `${fontSize}px`,
      }}>
      {children}
    </span>
  )
}
