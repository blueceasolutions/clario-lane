import { Route } from '@/routes/__root'
import { HeroSection } from './landing/components/hero-section'
import { SeoHead } from '@/components/shared'
import { Suspense, lazy } from 'react'

const FeaturesSection = lazy(() =>
  import('./landing/components/features-section').then((module) => ({
    default: module.FeaturesSection,
  })),
)
const RSVPSection = lazy(() =>
  import('./landing/components/rsvp-section').then((module) => ({
    default: module.RSVPSection,
  })),
)
const StatsSection = lazy(() =>
  import('./landing/components/stats-section').then((module) => ({
    default: module.StatsSection,
  })),
)
const TestimonialsSection = lazy(() =>
  import('./landing/components/testimonials-section').then((module) => ({
    default: module.TestimonialsSection,
  })),
)
const FooterCTA = lazy(() =>
  import('./landing/components/footer-cta').then((module) => ({
    default: module.FooterCTA,
  })),
)
const PricingSection = lazy(() =>
  import('./landing/components/pricing-section').then((module) => ({
    default: module.PricingSection,
  })),
)

export function LandingPage() {
  const { session, continent } = Route.useRouteContext()

  return (
    <div className='overflow-hidden'>
      <SeoHead
        title='Speed Reading & Retention'
        description='Train your brain to read faster and retain more with Clariolane.'
      />
      <HeroSection session={session} continent={continent} />
      <Suspense fallback={<div className='h-96' />}>
        <RSVPSection />
        <FeaturesSection />
        <StatsSection />
        <TestimonialsSection />
        <PricingSection continent={continent} />
        <FooterCTA session={session} continent={continent} />
      </Suspense>
    </div>
  )
}
