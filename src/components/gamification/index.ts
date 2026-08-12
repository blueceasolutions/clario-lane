export { DailyGoalRing } from "./DailyGoalRing";
export {
  StreakCounter,
  MAX_STREAK_FREEZES,
  STREAK_FREEZE_COST_XP,
} from "./StreakCounter";
export { LevelProgressBar } from "./LevelProgressBar";
export * from "./AchievementsGrid";
// NOT re-exported: "./VictoryModal", "./LevelUpModal" (canvas-confetti).
// Barrel-exporting them pulls that vendor code into every page that imports
// anything from '@/components', including the public landing page. Import
// directly from their own files, ideally via React.lazy().
