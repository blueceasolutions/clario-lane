import { describe, expect, it } from "vitest";
import {
  calculateBestTimeOfDay,
  getTimeOfDayBucket,
  type SessionForTimeOfDay,
} from "./bestTimeOfDay";

// Local-time Date constructor (not an ISO/UTC string) so .getHours() is
// deterministic regardless of the machine's timezone running the test.
const atHour = (hour: number) => new Date(2026, 0, 1, hour, 0, 0);

describe("getTimeOfDayBucket", () => {
  it("buckets morning hours", () => {
    expect(getTimeOfDayBucket(5)).toBe("Morning");
    expect(getTimeOfDayBucket(11)).toBe("Morning");
  });

  it("buckets afternoon hours", () => {
    expect(getTimeOfDayBucket(12)).toBe("Afternoon");
    expect(getTimeOfDayBucket(16)).toBe("Afternoon");
  });

  it("buckets evening hours", () => {
    expect(getTimeOfDayBucket(17)).toBe("Evening");
    expect(getTimeOfDayBucket(20)).toBe("Evening");
  });

  it("buckets night hours, including the wrap past midnight", () => {
    expect(getTimeOfDayBucket(21)).toBe("Night");
    expect(getTimeOfDayBucket(23)).toBe("Night");
    expect(getTimeOfDayBucket(0)).toBe("Night");
    expect(getTimeOfDayBucket(4)).toBe("Night");
  });
});

describe("calculateBestTimeOfDay", () => {
  it("picks the bucket with the highest average effective WPM", () => {
    const sessions: SessionForTimeOfDay[] = [
      // Morning: effective wpm (200*90/100=180, 220*90/100=198) avg 189
      { wpm: 200, comprehension: 90, createdAt: atHour(8) },
      { wpm: 220, comprehension: 90, createdAt: atHour(9) },
      // Evening: effective wpm (300*50/100=150, 300*50/100=150) avg 150
      { wpm: 300, comprehension: 50, createdAt: atHour(19) },
      { wpm: 300, comprehension: 50, createdAt: atHour(20) },
    ];

    expect(calculateBestTimeOfDay(sessions)).toEqual({
      bucket: "Morning",
      avgEffectiveWpm: 189,
      sessionCount: 2,
    });
  });

  it("ignores a bucket with only one session, even if it looks best", () => {
    const sessions: SessionForTimeOfDay[] = [
      { wpm: 500, comprehension: 100, createdAt: atHour(2) }, // Night, 1 session
      { wpm: 150, comprehension: 80, createdAt: atHour(8) }, // Morning
      { wpm: 160, comprehension: 80, createdAt: atHour(9) }, // Morning
    ];

    const result = calculateBestTimeOfDay(sessions);
    expect(result?.bucket).toBe("Morning");
  });

  it("returns null when no bucket has enough sessions", () => {
    const sessions: SessionForTimeOfDay[] = [
      { wpm: 200, comprehension: 90, createdAt: atHour(8) },
      { wpm: 220, comprehension: 90, createdAt: atHour(19) },
    ];

    expect(calculateBestTimeOfDay(sessions)).toBeNull();
  });

  it("returns null for no sessions", () => {
    expect(calculateBestTimeOfDay([])).toBeNull();
  });
});
