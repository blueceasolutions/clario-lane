import { Link, useRouteContext } from '@tanstack/react-router'
import { BookOpen } from 'lucide-react'
import { motion } from 'motion/react'

import { Button, ProfileMenu } from './ui'

const AnimateLink = motion.create(Link)

const Navbar = () => {
  const rootRoute = useRouteContext({ from: '__root__' })
  const { session } = rootRoute
  return (
    <nav
      className='w-full
      bg-background py-3 px-4'>
      <div className='max-w-6xl mx-auto flex items-center justify-between'>
        <AnimateLink
          whileHover={{ scale: 1.05 }}
          to='/'
          className='text-lg font-bold text-primary dark:text-primary-foreground flex gap-1 items-center'>
          <BookOpen className='size-6' />
          ClarioLane
        </AnimateLink>
        <div className='flex gap-4 items-center font-semibold'>
          {!session ? (
            <Button asChild>
              <AnimateLink to='/auth'>Sign in</AnimateLink>
            </Button>
          ) : (
            <ProfileMenu session={session} />
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
