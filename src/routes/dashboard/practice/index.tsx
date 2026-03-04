import { StartPracticeCard } from '@/components'
import { fetchPractices } from '@/integration'
import type { Practice } from '@/lib'

import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'

export const Route = createFileRoute('/dashboard/practice/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    const practices = (await context.queryClient.fetchQuery(
      fetchPractices,
    )) as Practice[]
    return { practices }
  },
})

export function RouteComponent() {
  const { practices } = Route.useLoaderData()

  return (
    <motion.div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {practices ? (
          practices.map((practice, index) => (
            <StartPracticeCard
              key={practice.id}
              delay={index}
              practice={practice}
            />
          ))
        ) : (
          <div>
            <p>No practice available</p>
          </div>
        )}
      </div>

      <div className='mt-8'>
        <p className='text-center text-muted-foreground/80 text-sm font-semibold'>
          Select a mode to begin your daily practice
        </p>
      </div>
    </motion.div>
  )
}
