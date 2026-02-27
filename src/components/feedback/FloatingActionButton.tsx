import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Settings as SettingsIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeedbackModal } from './FeedbackModal'
import { Link, useRouteContext } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import {
  FEEDBACK_KEY,
  FEEDBACK_STATE,
  SESSIONS_THRESHOLD,
  TOTAL_SESSIONS_KEY,
} from '@/lib'

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const { session: userSession, user } = useRouteContext({ from: '__root__' })
  const ref = useRef<HTMLDivElement>(null)

  const menuItems = [
    {
      icon: MessageCircle,
      label: 'Feedback',
      onClick: () => setShowFeedback(true),
    },
    {
      icon: SettingsIcon,
      label: 'Settings',
      href: '/dashboard/settings',
    },
  ]

  useEffect(() => {
    const getHasFeedback = localStorage.getItem(FEEDBACK_KEY)
    const hasFeedback = getHasFeedback === FEEDBACK_STATE.TRUE
    const totalSessions = user?.total_sessions || 0
    const storedTotalSessions = localStorage.getItem(TOTAL_SESSIONS_KEY)
    const storedTotalSessionsValue = storedTotalSessions
      ? parseInt(storedTotalSessions)
      : 0

    if (hasFeedback) {
      return
    }

    if (
      totalSessions - storedTotalSessionsValue >= SESSIONS_THRESHOLD &&
      !hasFeedback
    ) {
      setShowFeedback(true)
    }
  }, [userSession, user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (!userSession) {
    return null
  }

  return (
    <>
      {/* Floating Action Button */}
      <div
        ref={ref}
        className='fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3'>
        {/* Menu Items */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className='flex flex-col gap-2'>
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className='flex items-center gap-2'>
                  <span className='text-sm font-medium bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-full shadow-md'>
                    {item.label}
                  </span>
                  {item.href ? (
                    <Link to={item.href}>
                      <Button
                        size='icon'
                        className='h-12 w-12 rounded-full shadow-lg'
                        onClick={() => setIsOpen(false)}>
                        <item.icon className='h-5 w-5' />
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      size='icon'
                      className='h-12 w-12 rounded-full shadow-lg'
                      onClick={() => {
                        item.onClick?.()
                        setIsOpen(false)
                      }}>
                      <item.icon className='h-5 w-5' />
                    </Button>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <Button
          size='icon'
          className='h-14 w-14 rounded-full shadow-lg'
          onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <X className='h-6 w-6' />
          ) : (
            <MessageCircle className='h-6 w-6' />
          )}
        </Button>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal open={showFeedback} onOpenChange={setShowFeedback} />
    </>
  )
}
