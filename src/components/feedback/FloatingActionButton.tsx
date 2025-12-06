import { useState } from 'react'
import { MessageCircle, Settings as SettingsIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeedbackModal } from './FeedbackModal'
import { Link, useRouteContext } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const userSession = useRouteContext({ from: '__root__' }).session

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

  if (!userSession) {
    menuItems.pop()
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className='fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3'>
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
