import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { BookOpen } from 'lucide-react'
import { motion } from 'motion/react'

export const Route = createFileRoute('/auth')({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.session) return
    if (!context.user) throw redirect({ to: '/onboarding' })
    if (context.user?.onboarding_completed) {
      throw redirect({ to: '/dashboard' })
    }
  },
})

function RouteComponent() {
  return (
    <div className='bg-background min-h-[75svh] p-4 md:p-10'>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className='w-full max-w-lg space-y-6 mx-auto'>
        <div className='mx-auto w-fit '>
          <Link
            to='/'
            className='flex items-center gap-2 self-center font-medium '>
            <div className='bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md'>
              <BookOpen className='size-4' />
            </div>
            ClarioLane
          </Link>
        </div>
        <Outlet />
      </motion.div>
    </div>
  )
}
