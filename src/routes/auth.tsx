import { AuthPending } from '@/components'
import { SeoHead } from '@/components/shared'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { motion } from 'motion/react'

export const Route = createFileRoute('/auth')({
  component: RouteComponent,
  pendingComponent: AuthPending,
  beforeLoad: ({ context }) => {
    if (!context.session) return
    if (!context.user) throw redirect({ to: '/onboarding' })
    if (context.user?.onboarding_completed) {
      throw redirect({ to: '/dashboard/practice' })
    }
  },
})

function RouteComponent() {
  return (
    <div className='bg-background min-h-[75svh] p-5  md:p-10'>
      <SeoHead
        title='Authentication'
        description='Login or Sign up to Clariolane.'
      />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className='w-full max-w-lg space-y-6 mx-auto pt-28 md:pt-24'>
        <Outlet />
      </motion.div>
    </div>
  )
}
