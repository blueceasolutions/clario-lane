import { Eye, Layers, Target } from 'lucide-react'
import type { IFeature, ITestimonial, IStatistic } from '../types'

/**
 * Single Responsibility Principle: Data management only
 * All static content centralized here for easy maintenance
 * Open/Closed Principle: Adding new items doesn't require changing components
 */

/**
 * Demo words for hero section word cycling animation
 */
export const DEMO_WORDS = [
  'Train',
  'your',
  'brain',
  'to',
  'read',
  'faster',
  'with',
  'science',
] as const

/**
 * Features displayed in the features section
 */
export const FEATURES: readonly IFeature[] = [
  {
    id: 'daily-goals',
    icon: <Target className='w-6 h-6' />,
    title: 'Daily Goals',
    description: 'Build a streak and stay consistent.',
    variant: 'small',
  },
  {
    id: 'visual-drills',
    icon: <Eye className='w-6 h-6' />,
    title: 'Visual Speed Drills',
    description:
      'Pace yourself with our fluid visual guides that eliminate subvocalization.',
    variant: 'large',
  },

  {
    id: 'analytics',
    icon: <Layers className='w-6 h-6' />,
    title: 'Analytics',
    description:
      'Track your progress and get personalized coaching to help you reach your goals.',
    variant: 'small',
  },
] as const

/**
 * Testimonials for social proof section
 */
export const TESTIMONIALS: readonly ITestimonial[] = [
  {
    name: 'Sarah Chen',
    department: 'Researcher',
    text: 'I went from 250 WPM to 600 WPM in just 3 weeks. This platform transformed how I consume academic papers.',
    rating: 5,
    improvement: '2.4x faster',
  },
  {
    name: 'Michael Rodriguez',
    department: 'Product Manager',
    text: "The focus drills helped eliminate my subvocalization habit. I'm reading reports 3x faster now with better retention.",
    rating: 5,
    improvement: '3x faster',
  },
  {
    name: 'Emily Carter',
    department: 'Law Student',
    text: 'The platform helped me improve my reading speed and retention. I can now read case files much faster and with better comprehension.',
    rating: 5,
    improvement: '2x faster',
  },
] as const

/**
 * Statistics for metrics section
 */
export const STATISTICS: readonly IStatistic[] = [
  {
    number: '3X',
    label: 'Faster Reading Speed',
  },
  {
    number: '85%',
    label: 'Better Retention',
  },
  {
    number: '20M+',
    label: 'Words Read',
  },
] as const

/**
 * Configuration constants
 */
export const WORD_CYCLING_INTERVAL_MS = 600
export const ACTIVE_READERS_COUNT = '30k+'
