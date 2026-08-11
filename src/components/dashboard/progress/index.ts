export * from "./StatsOverview";
// NOT re-exported: "./ProgressCharts", "./ActivityChart" (recharts).
// Barrel-exporting them pulls that vendor code into every page that imports
// anything from '@/components', including the public landing page. Import
// directly from their own files, ideally via React.lazy().
export * from "./AchievementsCard";
export * from "./MilestonesCard";
