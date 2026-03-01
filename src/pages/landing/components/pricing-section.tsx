import { PricingCard } from '@/components/pricingCard'
import { motion } from 'motion/react'
import { useRouter } from '@tanstack/react-router'
import { SUBSCRIPTION_PRICE } from '@/lib'

type Props = {
  continent: string | undefined
}

export function PricingSection({ continent }: Props) {
  const router = useRouter()
  return (
    <section className='py-24 px-4 bg-background relative overflow-hidden'>
      {/* Subtle Background Glows */}
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px]' />
        <div className='absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[100px]' />
      </div>

      <div className='container mx-auto max-w-4xl relative z-10'>
        <div className='text-center mb-16 space-y-4'>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className='text-3xl md:text-5xl font-extrabold tracking-tight text-foreground'>
            Simple pricing for serious students
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className='text-lg md:text-xl text-muted-foreground'>
            One plan. All features. Focus on reading, not upselling.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className='max-w-xl mx-auto'>
          <PricingCard
            title='Scholar Plan'
            price={continent === 'AF' ? SUBSCRIPTION_PRICE.af : SUBSCRIPTION_PRICE.global}
            currency='USD'
            frequency='mo'
            description='Full access to the platform'
            badge='POPULAR'
            popular={true}
            ctaLabel='Get Started'
            onCta={() => {
              router.navigate({ to: '/auth' })
              // The primary CTA navigation logic will likely run within the global root context or router.
              // We'll leave it as a link wrapper or let the parent component pass down the logic if needed.
              // For now, adhering to the component's internal design which accepts `onCta`.
            }}
            features={[
              'Unlimited articles',
              'Advanced analytics',
              'Multiple training sessions',
              'Variety of training types',
            ]}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className='mt-12 text-center'>
          <p className='text-sm text-muted-foreground'>
            Are you a university or institution?{' '}
            <a
              href='mailto:blueceasolutions@gmail.com'
              className='text-purple-600 dark:text-purple-400 font-medium hover:underline hover:text-purple-700 transition-colors'>
              Contact us for bulk licensing.
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
