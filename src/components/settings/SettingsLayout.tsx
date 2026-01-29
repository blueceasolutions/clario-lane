import type { ReactNode } from 'react'

interface SettingsLayoutProps {
  children: ReactNode
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className='space-y-6 max-w-sm mx-auto'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Settings</h2>
        <p className='text-muted-foreground'>
          Manage your account settings and preferences.
        </p>
      </div>
      <div className='grid gap-2 md:gap-4 '>{children}</div>
    </div>
  )
}
