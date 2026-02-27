import { TestimonialCard } from '@/components'
import { TESTIMONIALS } from '../data'

/**
 * Single Responsibility: Layout and section structure only
 * Open/Closed: Adding testimonials requires only data changes, not code
 */
export function TestimonialsSection() {
  return (
    <section className='py-24 px-4 bg-gradient-to-b from-purple-50/30 to-background dark:from-purple-950/10 dark:to-background'>
      <div className='container mx-auto max-w-6xl'>
        <h2 className='text-4xl md:text-5xl font-bold text-center mb-12'>
          Learner Stories
        </h2>
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              name={testimonial.name}
              department={testimonial.department}
              text={testimonial.text}
              rating={testimonial.rating}
              improvement={testimonial.improvement}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
