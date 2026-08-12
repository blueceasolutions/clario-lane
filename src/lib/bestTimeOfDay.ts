// Surfaces when a user's own session history shows their strongest
// WPM/comprehension combination, so the nudge is "practice around 8am" not
// just "your comprehension is low." Computed client-side deliberately:
// created_at is stored as UTC and there's no per-user timezone column
// anywhere in this app (see send_daily_reminders's comment on the same
// gap), so the browser's local time at render time is actually the only
// place this can be computed against the user's real day.

export type TimeOfDayBucket = "Morning" | "Afternoon" | "Evening" | "Night";

export function getTimeOfDayBucket(hour: number): TimeOfDayBucket {
  if (hour >= 5 && hour <= 11) return "Morning";
  if (hour >= 12 && hour <= 16) return "Afternoon";
  if (hour >= 17 && hour <= 20) return "Evening";
  return "Night"; // 21:00-23:59 or 0:00-4:59
}

export type SessionForTimeOfDay = {
  wpm: number;
  comprehension: number;
  createdAt: string | Date;
};

export type BestTimeOfDayInsight = {
  bucket: TimeOfDayBucket;
  avgEffectiveWpm: number;
  sessionCount: number;
};

// A bucket needs at least this many sessions before it's eligible to be
// "the best" -- one lucky fast session at 2am shouldn't get surfaced as a
// pattern.
const MIN_SESSIONS_PER_BUCKET = 2;

export function calculateBestTimeOfDay(
  sessions: SessionForTimeOfDay[],
): BestTimeOfDayInsight | null {
  const buckets = new Map<TimeOfDayBucket, { total: number; count: number }>();

  for (const session of sessions) {
    const hour = new Date(session.createdAt).getHours();
    const bucket = getTimeOfDayBucket(hour);
    const effectiveWpm = (session.wpm * session.comprehension) / 100;

    const entry = buckets.get(bucket) ?? { total: 0, count: 0 };
    entry.total += effectiveWpm;
    entry.count += 1;
    buckets.set(bucket, entry);
  }

  let best: BestTimeOfDayInsight | null = null;
  for (const [bucket, { total, count }] of buckets) {
    if (count < MIN_SESSIONS_PER_BUCKET) continue;
    const avgEffectiveWpm = Math.round(total / count);
    if (!best || avgEffectiveWpm > best.avgEffectiveWpm) {
      best = { bucket, avgEffectiveWpm, sessionCount: count };
    }
  }

  return best;
}
