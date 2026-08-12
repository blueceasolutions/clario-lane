import { describe, expect, it } from "vitest";
import {
  filterPassages,
  getAvailableDifficulties,
  getAvailableTags,
  getLengthBucket,
} from "./passageFilters";

const shortText = Array(50).fill("word").join(" "); // 50 words
const mediumText = Array(500).fill("word").join(" "); // 500 words
const longText = Array(900).fill("word").join(" "); // 900 words

const PASSAGES = [
  { id: "1", difficulty: "Easy", tags: ["fiction", "mystery"], text: shortText },
  { id: "2", difficulty: "Medium", tags: ["non-fiction"], text: mediumText },
  { id: "3", difficulty: "Hard", tags: ["fiction", "sci-fi"], text: longText },
];

describe("getLengthBucket", () => {
  it("buckets below the short threshold as short", () => {
    expect(getLengthBucket(0)).toBe("short");
    expect(getLengthBucket(299)).toBe("short");
  });

  it("buckets the medium range inclusively", () => {
    expect(getLengthBucket(300)).toBe("medium");
    expect(getLengthBucket(700)).toBe("medium");
  });

  it("buckets above the medium threshold as long", () => {
    expect(getLengthBucket(701)).toBe("long");
  });
});

describe("filterPassages", () => {
  it("returns everything when no criteria are given", () => {
    expect(filterPassages(PASSAGES, {})).toHaveLength(3);
  });

  it("filters by difficulty", () => {
    const result = filterPassages(PASSAGES, { difficulty: "Easy" });
    expect(result.map((p) => p.id)).toEqual(["1"]);
  });

  it("filters by tag", () => {
    const result = filterPassages(PASSAGES, { tag: "fiction" });
    expect(result.map((p) => p.id).sort()).toEqual(["1", "3"]);
  });

  it("filters by length bucket", () => {
    expect(filterPassages(PASSAGES, { length: "short" }).map((p) => p.id))
      .toEqual(["1"]);
    expect(filterPassages(PASSAGES, { length: "medium" }).map((p) => p.id))
      .toEqual(["2"]);
    expect(filterPassages(PASSAGES, { length: "long" }).map((p) => p.id))
      .toEqual(["3"]);
  });

  it("combines multiple criteria with AND semantics", () => {
    const result = filterPassages(PASSAGES, {
      tag: "fiction",
      length: "long",
    });
    expect(result.map((p) => p.id)).toEqual(["3"]);
  });

  it("returns an empty array when nothing matches", () => {
    const result = filterPassages(PASSAGES, { difficulty: "Easy", tag: "sci-fi" });
    expect(result).toEqual([]);
  });
});

describe("getAvailableTags", () => {
  it("returns the deduplicated, sorted set of tags across all passages", () => {
    expect(getAvailableTags(PASSAGES)).toEqual([
      "fiction",
      "mystery",
      "non-fiction",
      "sci-fi",
    ]);
  });

  it("returns an empty array for no passages", () => {
    expect(getAvailableTags([])).toEqual([]);
  });
});

describe("getAvailableDifficulties", () => {
  it("returns the deduplicated, sorted set of difficulties", () => {
    expect(getAvailableDifficulties(PASSAGES)).toEqual([
      "Easy",
      "Hard",
      "Medium",
    ]);
  });
});
