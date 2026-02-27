import type { ReactNode } from "react";

/**
 * Interface Segregation Principle: Minimal, focused interfaces
 * Each interface represents a single concept with only required properties
 */

/**
 * Feature representation for feature cards
 */
export interface IFeature {
  readonly id: string;
  readonly icon: ReactNode;
  readonly title: string;
  readonly description: string;
  readonly variant?: "large" | "small";
}

/**
 * Testimonial representation for social proof
 */
export interface ITestimonial {
  readonly name: string;
  readonly department: string;
  readonly text: string;
  readonly rating: number;
  readonly improvement: string;
}

/**
 * Statistic representation for metrics display
 */
export interface IStatistic {
  readonly number: string;
  readonly label: string;
}

/**
 * Navigation handler abstraction (Dependency Inversion Principle)
 * High-level components depend on this abstraction, not concrete routing
 */
export interface INavigationHandler {
  readonly primaryAction: () => void;
  readonly primaryLabel: string;
  readonly hasDashboardAccess: boolean;
}

/**
 * Animation configuration for scroll effects
 */
export interface IAnimationConfig {
  readonly startScroll: number;
  readonly endScroll: number;
  readonly startValue: number;
  readonly endValue: number;
}

/**
 * Word cycling configuration
 */
export interface IWordCyclerConfig {
  readonly words: readonly string[];
  readonly intervalMs: number;
}

/**
 * Word cycler state returned by hook
 */
export interface IWordCyclerState {
  readonly currentWord: string;
  readonly progress: number;
  readonly wordIndex: number;
  readonly isPlaying: boolean;
  readonly totalWords: number;
  readonly togglePlay: () => void;
  readonly restart: () => void;
}
