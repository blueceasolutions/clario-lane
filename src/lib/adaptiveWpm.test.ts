import { describe, expect, it } from "vitest";
import { calculateNextDifficulty, calculateNextWpm } from "./adaptiveWpm";
import { READING_SPEED_RANGE } from "./constants/exercise";

describe("calculateNextWpm", () => {
  it("increases speed by 10% on strong comprehension (>= 80%)", () => {
    expect(calculateNextWpm(200, 80)).toBe(220);
    expect(calculateNextWpm(200, 100)).toBe(220);
  });

  it("decreases speed by 10% on weak comprehension (< 60%)", () => {
    expect(calculateNextWpm(200, 59)).toBe(180);
    expect(calculateNextWpm(200, 0)).toBe(180);
  });

  it("leaves speed unchanged in the middle band [60, 80)", () => {
    expect(calculateNextWpm(200, 60)).toBe(200);
    expect(calculateNextWpm(200, 79)).toBe(200);
  });

  it("rounds the 10% adjustment to the nearest whole wpm", () => {
    // 10% of 205 = 20.5 -> rounds to 21
    expect(calculateNextWpm(205, 80)).toBe(226);
  });

  it("never exceeds READING_SPEED_RANGE.MAX", () => {
    expect(calculateNextWpm(READING_SPEED_RANGE.MAX, 80)).toBe(
      READING_SPEED_RANGE.MAX,
    );
    expect(calculateNextWpm(READING_SPEED_RANGE.MAX - 5, 80)).toBe(
      READING_SPEED_RANGE.MAX,
    );
  });

  it("never drops below READING_SPEED_RANGE.MIN", () => {
    expect(calculateNextWpm(READING_SPEED_RANGE.MIN, 0)).toBe(
      READING_SPEED_RANGE.MIN,
    );
    expect(calculateNextWpm(READING_SPEED_RANGE.MIN + 2, 0)).toBe(
      READING_SPEED_RANGE.MIN,
    );
  });
});

describe("calculateNextDifficulty", () => {
  it("steps up one level on strong comprehension (>= 80%)", () => {
    expect(calculateNextDifficulty("Easy", 80)).toBe("Medium");
    expect(calculateNextDifficulty("Medium", 100)).toBe("Hard");
  });

  it("steps down one level on weak comprehension (< 60%)", () => {
    expect(calculateNextDifficulty("Hard", 59)).toBe("Medium");
    expect(calculateNextDifficulty("Medium", 0)).toBe("Easy");
  });

  it("holds steady in the middle band [60, 80)", () => {
    expect(calculateNextDifficulty("Medium", 60)).toBe("Medium");
    expect(calculateNextDifficulty("Medium", 79)).toBe("Medium");
  });

  it("never exceeds Hard", () => {
    expect(calculateNextDifficulty("Hard", 80)).toBe("Hard");
  });

  it("never drops below Easy", () => {
    expect(calculateNextDifficulty("Easy", 0)).toBe("Easy");
  });
});
