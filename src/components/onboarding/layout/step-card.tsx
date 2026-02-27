import { motion } from 'motion/react'
import { cn } from '@/lib'
import { Card } from '@/components/ui/card'

type StepCardProps = {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  footer?: React.ReactNode
}

export function StepCard({
  children,
  className,
  title,
  description,
  footer,
}: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -10 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className='w-full max-w-2xl mx-auto'>
      <Card
        className={cn(
          'relative overflow-hidden border-border/40 shadow-xl bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl',
          'transition-all duration-300',
          className,
        )}>
        {/* Subtle top gradient line */}
        <div className='absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary/0 via-primary/50 to-primary/0 opacity-50' />

        <div className='p-4 md:p-6 space-y-6'>
          {(title || description) && (
            <div className='text-center space-y-2 mb-8'>
              {title && (
                <h2 className='text-xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-br from-foreground to-foreground/70'>
                  {title}
                </h2>
              )}
              {description && (
                <p className='text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed'>
                  {description}
                </p>
              )}
            </div>
          )}

          <div className='relative z-10'>{children}</div>

          {footer && (
            <div className='pt-8 mt-4 border-t border-border/40'>{footer}</div>
          )}
        </div>

        {/* Decorative background blobs */}
        <div className='absolute top-0 right-0 -transtale-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10' />
        <div className='absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl -z-10' />
      </Card>
    </motion.div>
  )
}
