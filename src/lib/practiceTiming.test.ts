import { describe, expect, it } from "vitest";
import {
  advanceIndex,
  elapsedProgressPercent,
  estimatedDurationSeconds,
  indexProgressPercent,
  msPerChunk,
  msPerWord,
  splitIntoWords,
} from "./practiceTiming";

describe("splitIntoWords", () => {
  it("splits on whitespace", () => {
    expect(splitIntoWords("the quick brown fox")).toEqual([
      "the",
      "quick",
      "brown",
      "fox",
    ]);
  });

  it("collapses runs of whitespace and newlines", () => {
    expect(splitIntoWords("the  quick\nbrown\tfox")).toEqual([
      "the",
      "quick",
      "brown",
      "fox",
    ]);
  });

  it("drops empty tokens from leading/trailing whitespace", () => {
    expect(splitIntoWords("  hello world  ")).toEqual(["hello", "world"]);
  });

  it("returns an empty array for undefined, null, or empty text", () => {
    expect(splitIntoWords(undefined)).toEqual([]);
    expect(splitIntoWords(null)).toEqual([]);
    expect(splitIntoWords("")).toEqual([]);
    expect(splitIntoWords("   ")).toEqual([]);
  });
});

describe("msPerWord", () => {
  it("computes milliseconds per word from words-per-minute", () => {
    // 60 wpm = 1 word/sec = 1000ms/word
    expect(msPerWord(60)).toBe(1000);
    // 300 wpm = 5 words/sec = 200ms/word
    expect(msPerWord(300)).toBe(200);
  });

  it("is slower (larger ms) at lower wpm", () => {
    expect(msPerWord(100)).toBeGreaterThan(msPerWord(400));
  });
});

describe("msPerChunk", () => {
  it("scales linearly with chunk size", () => {
    expect(msPerChunk(300, 1)).toBe(200);
    expect(msPerChunk(300, 3)).toBe(600);
  });

  it("matches msPerWord for a chunk size of 1", () => {
    expect(msPerChunk(250, 1)).toBe(msPerWord(250));
  });
});

describe("advanceIndex", () => {
  it("advances by step when short of the end", () => {
    expect(advanceIndex(0, 1, 10)).toEqual({ index: 1, isComplete: false });
    expect(advanceIndex(4, 3, 10)).toEqual({ index: 7, isComplete: false });
  });

  it("clamps to totalWords and reports completion when the step reaches the end", () => {
    expect(advanceIndex(9, 1, 10)).toEqual({ index: 10, isComplete: true });
  });

  it("clamps to totalWords and reports completion when the step overshoots the end", () => {
    // word-chunking: chunkSize doesn't evenly divide the remaining words
    expect(advanceIndex(8, 5, 10)).toEqual({ index: 10, isComplete: true });
  });

  it("treats landing exactly on the last word as complete", () => {
    expect(advanceIndex(7, 3, 10)).toEqual({ index: 10, isComplete: true });
  });
});

describe("indexProgressPercent", () => {
  it("computes percent complete by word index", () => {
    expect(indexProgressPercent(0, 200)).toBe(0);
    expect(indexProgressPercent(50, 200)).toBe(25);
    expect(indexProgressPercent(200, 200)).toBe(100);
  });

  it("returns 0 for an empty passage instead of dividing by zero", () => {
    expect(indexProgressPercent(0, 0)).toBe(0);
  });
});

describe("estimatedDurationSeconds", () => {
  it("computes seconds to read the passage at a given wpm", () => {
    // 300 words at 300 wpm = 1 minute = 60s
    expect(estimatedDurationSeconds(300, 300)).toBe(60);
    // 150 words at 300 wpm = 30s
    expect(estimatedDurationSeconds(150, 300)).toBe(30);
  });

  it("returns 0 for an empty passage", () => {
    expect(estimatedDurationSeconds(0, 300)).toBe(0);
  });
});

describe("elapsedProgressPercent", () => {
  it("computes percent of estimated duration elapsed", () => {
    expect(elapsedProgressPercent(0, 60)).toBe(0);
    expect(elapsedProgressPercent(30, 60)).toBe(50);
    expect(elapsedProgressPercent(60, 60)).toBe(100);
  });

  it("clamps at 100 even if elapsed overshoots the estimate", () => {
    expect(elapsedProgressPercent(75, 60)).toBe(100);
  });

  it("returns 0 when there is no estimated duration yet", () => {
    expect(elapsedProgressPercent(5, 0)).toBe(0);
  });
});
