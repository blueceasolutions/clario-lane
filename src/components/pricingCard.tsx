import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Check } from 'lucide-react'
import { formatCurrency } from '@/lib'
import { motion } from 'motion/react'
import { cn } from '@/lib'

export type PricingCardProps = {
  title: string
  price: number
  currency?: string
  frequency?: string
  description?: string
  badge?: string
  features?: string[]
  popular?: boolean
  ctaLabel?: string
  onCta?: () => void
  className?: string
}

export default function PricingCard({
  title,
  price,
  currency = 'NGN',
  frequency = 'mo',
  description,
  badge,
  features = [],
  popular = false,
  ctaLabel = 'Get started',
  onCta,
  className = '',
}: PricingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn('w-full', className)}>
      <Card
        className={cn(
          'relative h-full flex flex-col overflow-hidden transition-all duration-300',
          popular
            ? 'border-transparent shadow-2xl ring-2 ring-primary/20 dark:ring-primary/40'
            : 'border-border/50 shadow-lg hover:border-primary/20',
          'bg-white dark:bg-zinc-950/50 backdrop-blur-sm'
        )}>
        {/* Gradient Background Effect for Popular Card */}
        {popular && (
          <div className='absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:to-transparent pointer-events-none' />
        )}

        {/* Top Highlight Line */}
        <div
          className={cn(
            'absolute top-0 left-0 w-full h-1',
            popular
              ? 'bg-linear-to-r from-primary to-purple-600'
              : 'bg-transparent group-hover:bg-linear-to-r group-hover:from-gray-300 group-hover:to-gray-400'
          )}
        />

        <CardHeader className='flex flex-col gap-2 pb-8 relative z-10'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-xl font-bold tracking-tight'>
              {title}
            </CardTitle>
            {badge && (
              <Badge
                variant='secondary'
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary dark:bg-primary/20 hover:bg-primary/15'
                )}>
                {badge}
              </Badge>
            )}
          </div>
          {description && (
            <CardDescription className='text-sm text-muted-foreground leading-relaxed'>
              {description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className='flex-1 flex flex-col gap-6 relative z-10'>
          <div className='flex items-baseline gap-1'>
            <span className='text-4xl font-bold tracking-tight text-foreground'>
              {formatCurrency(price, currency)}
            </span>
            <span className='text-sm font-medium text-muted-foreground/80'>
              /{frequency.slice(0, 2)}
            </span>
          </div>

          <Separator className='bg-border/60' />

          <ul className='flex flex-col gap-3'>
            {features.length === 0 ? (
              <li className='text-sm text-muted-foreground italic'>
                No features listed.
              </li>
            ) : (
              features.map((f, i) => (
                <li key={i} className='flex items-start gap-3 text-sm'>
                  <div className='mt-0.5 min-w-5 flex justify-center'>
                    <div className='w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
                      <Check className='w-3 h-3 text-green-600 dark:text-green-400' />
                    </div>
                  </div>
                  <span className='text-muted-foreground leading-snug'>
                    {f}
                  </span>
                </li>
              ))
            )}
          </ul>
        </CardContent>

        <CardFooter className='flex flex-col gap-4 pt-8 relative z-10'>
          <Button
            className={cn(
              'w-full h-11 text-sm font-semibold transition-all duration-300 rounded-lg',
              popular
                ? 'bg-linear-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-primary/25'
                : 'hover:bg-secondary/80'
            )}
            variant={popular ? 'default' : 'outline'}
            onClick={onCta}
            size='lg'>
            {ctaLabel}
          </Button>

          {popular && (
            <div className='text-center text-xs font-medium text-primary/80 animate-pulse'>
              🔥 Most popular choice
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
