import { useState } from 'react'
import { CustomPassageModal, StartPracticeCard } from '@/components'
import { Button } from '@/components/ui/button'
import { fetchPractices } from '@/integration'
import type { Practice } from '@/lib'
import { BookMarked, Library, PenLine, Swords } from 'lucide-react'

import { createFileRoute, Link } from '@tanstack/react-router'
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
        <div className='flex flex-wrap items-center justify-center gap-3'>
          <Button
            variant='outline'
            onClick={() => setCustomModalOpen(true)}
            className='gap-2'>
            <PenLine className='w-4 h-4' />
            Practice with your own text
          </Button>
          <Button variant='outline' className='gap-2' asChild>
            <Link to='/dashboard/practice/browse'>
              <Library className='w-4 h-4' />
              Browse passages
            </Link>
          </Button>
          <Button variant='outline' className='gap-2' asChild>
            <Link to='/dashboard/vocabulary'>
              <BookMarked className='w-4 h-4' />
              Review vocabulary
            </Link>
          </Button>
          <Button variant='outline' className='gap-2' asChild>
            <Link to='/dashboard/race'>
              <Swords className='w-4 h-4' />
              Race a friend
            </Link>
          </Button>
        </div>
      </div>

      <CustomPassageModal
        open={customModalOpen}
        onOpenChange={setCustomModalOpen}
      />
    </motion.div>
  )
}
