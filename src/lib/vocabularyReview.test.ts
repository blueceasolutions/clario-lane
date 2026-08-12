import { describe, expect, it } from "vitest";
import {
  addDays,
  calculateNextReviewInterval,
  MAX_REVIEW_INTERVAL_DAYS,
  MIN_REVIEW_INTERVAL_DAYS,
} from "./vocabularyReview";

describe("calculateNextReviewInterval", () => {
  it("doubles the interval when the word was remembered", () => {
    expect(calculateNextReviewInterval(1, true)).toBe(2);
    expect(calculateNextReviewInterval(4, true)).toBe(8);
  });

  it("resets to the minimum interval when forgotten", () => {
    expect(calculateNextReviewInterval(32, false)).toBe(MIN_REVIEW_INTERVAL_DAYS);
    expect(calculateNextReviewInterval(1, false)).toBe(MIN_REVIEW_INTERVAL_DAYS);
  });

  it("caps growth at the maximum interval", () => {
    expect(calculateNextReviewInterval(40, true)).toBe(MAX_REVIEW_INTERVAL_DAYS);
    expect(calculateNextReviewInterval(MAX_REVIEW_INTERVAL_DAYS, true)).toBe(
      MAX_REVIEW_INTERVAL_DAYS,
    );
  });
});

describe("addDays", () => {
  it("adds whole days to a date", () => {
    expect(addDays(new Date("2026-01-01T00:00:00.000Z"), 1)).toEqual(
      new Date("2026-01-02T00:00:00.000Z"),
    );
  });

  it("rolls over month and year boundaries", () => {
    expect(addDays(new Date("2026-01-31T00:00:00.000Z"), 1)).toEqual(
      new Date("2026-02-01T00:00:00.000Z"),
    );
    expect(addDays(new Date("2025-12-31T00:00:00.000Z"), 1)).toEqual(
      new Date("2026-01-01T00:00:00.000Z"),
    );
  });

  it("does not mutate the input date", () => {
    const original = new Date("2026-01-01T00:00:00.000Z");
    addDays(original, 5);
    expect(original).toEqual(new Date("2026-01-01T00:00:00.000Z"));
  });
});
