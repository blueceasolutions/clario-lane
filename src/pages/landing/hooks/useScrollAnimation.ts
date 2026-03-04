import { type MotionValue, useScroll, useTransform } from "motion/react";
import type { IAnimationConfig } from "../types";

/**
 * Single Responsibility: Manages scroll-based animations
 * Open/Closed: Extensible through configuration, no modification needed
 *
 * @param opacityConfig - Configuration for opacity animation
 * @param yConfig - Configuration for Y-axis transform animation
 * @returns Motion values for opacity and Y transform
 */
export function useScrollAnimation(
  opacityConfig: IAnimationConfig,
  yConfig: IAnimationConfig,
): {
  opacity: MotionValue<number>;
  y: MotionValue<number>;
} {
  const { scrollY } = useScroll();

  const opacity = useTransform(
    scrollY,
    [opacityConfig.startScroll, opacityConfig.endScroll],
    [opacityConfig.startValue, opacityConfig.endValue],
  );

  const y = useTransform(
    scrollY,
    [yConfig.startScroll, yConfig.endScroll],
    [yConfig.startValue, yConfig.endValue],
  );

  return { opacity, y };
}
