import { useState } from 'react'
import { CustomPassageModal, StartPracticeCard } from '@/components'
import { Button } from '@/components/ui/button'
import { fetchPractices } from '@/integration'
import type { Practice } from '@/lib'
import { PenLine } from 'lucide-react'

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

function RouteComponent() {
  const { practices } = Route.useLoaderData()
  const [customModalOpen, setCustomModalOpen] = useState(false)

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

      <div className='mt-8 flex flex-col items-center gap-4'>
        <p className='text-center text-muted-foreground/80 text-sm font-semibold'>
          Select a mode to begin your daily practice
        </p>
        <Button
          variant='outline'
          onClick={() => setCustomModalOpen(true)}
          className='gap-2'>
          <PenLine className='w-4 h-4' />
          Practice with your own text
        </Button>
      </div>

      <CustomPassageModal
        open={customModalOpen}
        onOpenChange={setCustomModalOpen}
      />
    </motion.div>
  )
}
