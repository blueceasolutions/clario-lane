import type { Session } from '@supabase/supabase-js'
import { useNavigation } from '../hooks/useNavigation'
import { CTAButton } from './presentational/CTAButton'

/**
 * Single Responsibility: CTA section presentation only
 * Dependency Inversion: Uses navigation abstraction, not concrete routing
 */
interface FooterCTAProps {
  session: Session | null
}

export function FooterCTA({ session }: FooterCTAProps) {
  const navigation = useNavigation(session)

  return (
    <section className='py-20 px-4 bg-[#F5F5F7] dark:bg-black'>
      <div className='container mx-auto max-w-[1400px]'>
        <div className='bg-white dark:bg-[#1A1625] rounded-[3rem] p-12 md:p-24 text-center shadow-lg relative overflow-hidden'>
          {/* Subtle Background Glows */}
          <div className='absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-purple-50/50 to-transparent dark:from-purple-900/10 pointer-events-none' />

          <div className='relative z-10 max-w-3xl mx-auto'>
            <h2 className='text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight text-[#111827] dark:text-white'>
              Ready to unlock your{' '}
              <span className='text-[#A855F7]'>brain's potential?</span>
            </h2>
            <p className='text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-xl mx-auto font-medium'>
              Join us in mastering your reading skills and thank your future
              self for it.
            </p>
            <CTAButton
              label='Get Started Now'
              onClick={navigation.primaryAction}
              variant='primary'
              className='bg-[#A855F7] hover:bg-[#9333EA] text-white rounded-full h-14 px-10 text-lg font-bold shadow-xl shadow-purple-500/20'
            />
          </div>
        </div>
      </div>
    </section>
  )
}
