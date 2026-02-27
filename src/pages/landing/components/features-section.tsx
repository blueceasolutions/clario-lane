import { motion } from 'motion/react'
import { FEATURES } from '../data'
import { FeatureCard } from './presentational/FeatureCard'

/**
 * Single Responsibility: Layout and section structure only
 * Open/Closed: Adding features requires only data changes, not code
 */
export function FeaturesSection() {
  return (
    <section className='py-24 px-4 relative bg-[#F5F5F7] dark:bg-black'>
      <div className='container mx-auto max-w-6xl'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='text-center mb-16 space-y-4'>
          <h2 className='text-4xl md:text-5xl font-extrabold tracking-tight text-[#111827] dark:text-white'>
            Intelligent Training
          </h2>
          <p className='text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto'>
            Designed for clarity and focus, our tools adapt to your pace
            seamlessly.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch'>
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
