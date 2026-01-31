import { useEffect, type ReactNode } from 'react'
import { useSettingsStore } from '@/store'
import { useRouteContext } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchPreferences } from '@/integration/queries/fetchPreferences'

type SettingsProviderProps = {
  children: ReactNode
}

const fontFamilyMap = {
  Inter: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  Dyslexie: '"OpenDyslexic", sans-serif',
  Serif: 'Georgia, "Times New Roman", serif',
  Mono: '"Courier New", Courier, monospace',
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { fontFace, fontSizeScale, theme, syncPreferences } = useSettingsStore()
  const context = useRouteContext({ from: '__root__' })
  const user = context.user

  const { data: preferences } = useQuery(fetchPreferences(user?.id))

  // Sync preferences from server to store
  useEffect(() => {
    if (preferences) {
      syncPreferences(preferences)
    }
  }, [preferences, syncPreferences])

  // Apply theme class to document root
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark', 'sepia')

    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      const applySystemTheme = () => {
        root.classList.remove('light', 'dark', 'sepia')
        root.classList.add(mediaQuery.matches ? 'dark' : 'light')
      }

      applySystemTheme()

      mediaQuery.addEventListener('change', applySystemTheme)
      return () => mediaQuery.removeEventListener('change', applySystemTheme)
    }

    root.classList.add(theme)
  }, [theme])

  // Apply font face to body
  useEffect(() => {
    const fontFamily = fontFamilyMap[fontFace]
    document.body.style.fontFamily = fontFamily
  }, [fontFace])

  // Apply font size scale to root (1rem = base size)
  useEffect(() => {
    const baseFontSize = 16 // 16px is the browser default
    const scaledSize = (baseFontSize * fontSizeScale) / 100
    document.documentElement.style.fontSize = `${scaledSize}px`
  }, [fontSizeScale])

  return <>{children}</>
}
