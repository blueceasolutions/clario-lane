import { describe, expect, it } from "vitest";
import {
  calculateComprehensionByCategory,
  calculateComprehensionByDifficulty,
  type SessionWithPassage,
} from "./comprehensionBreakdown";

describe("calculateComprehensionByCategory", () => {
  it("averages comprehension per tag, weakest first", () => {
    const sessions: SessionWithPassage[] = [
      { comprehension: 90, passages: { tags: ["fiction"], difficulty: "Easy" } },
      { comprehension: 60, passages: { tags: ["mystery"], difficulty: "Hard" } },
      { comprehension: 80, passages: { tags: ["fiction"], difficulty: "Medium" } },
    ];

    expect(calculateComprehensionByCategory(sessions)).toEqual([
      { category: "mystery", avgComprehension: 60, sessionCount: 1 },
      { category: "fiction", avgComprehension: 85, sessionCount: 2 },
    ]);
  });

  it("attributes a session to every tag its passage has", () => {
    const sessions: SessionWithPassage[] = [
      {
        comprehension: 100,
        passages: { tags: ["fiction", "mystery"], difficulty: "Medium" },
      },
    ];

    const result = calculateComprehensionByCategory(sessions);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.category).sort()).toEqual(["fiction", "mystery"]);
  });

  it("excludes sessions with no passage (custom text)", () => {
    const sessions: SessionWithPassage[] = [
      { comprehension: 100, passages: null },
    ];

    expect(calculateComprehensionByCategory(sessions)).toEqual([]);
  });

  it("returns an empty array for no sessions", () => {
    expect(calculateComprehensionByCategory([])).toEqual([]);
  });
});

describe("calculateComprehensionByDifficulty", () => {
  it("averages comprehension per difficulty, in Easy/Medium/Hard order", () => {
    const sessions: SessionWithPassage[] = [
      { comprehension: 60, passages: { tags: [], difficulty: "Hard" } },
      { comprehension: 90, passages: { tags: [], difficulty: "Easy" } },
      { comprehension: 75, passages: { tags: [], difficulty: "Medium" } },
    ];

    expect(calculateComprehensionByDifficulty(sessions)).toEqual([
      { difficulty: "Easy", avgComprehension: 90, sessionCount: 1 },
      { difficulty: "Medium", avgComprehension: 75, sessionCount: 1 },
      { difficulty: "Hard", avgComprehension: 60, sessionCount: 1 },
    ]);
  });

  it("omits difficulties with no sessions rather than showing a zero bar", () => {
    const sessions: SessionWithPassage[] = [
      { comprehension: 90, passages: { tags: [], difficulty: "Easy" } },
    ];

    expect(calculateComprehensionByDifficulty(sessions)).toEqual([
      { difficulty: "Easy", avgComprehension: 90, sessionCount: 1 },
    ]);
  });

  it("excludes sessions with no passage (custom text)", () => {
    const sessions: SessionWithPassage[] = [
      { comprehension: 100, passages: null },
    ];

    expect(calculateComprehensionByDifficulty(sessions)).toEqual([]);
  });
});
