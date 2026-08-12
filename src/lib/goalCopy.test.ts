import { describe, expect, it } from "vitest";
import { getGoalBannerCopy } from "./goalCopy";

describe("getGoalBannerCopy", () => {
  it("returns goal-specific copy for a recognized single goal", () => {
    const copy = getGoalBannerCopy(["Increase Speed"]);
    expect(copy.headline).toBe("Ready to read faster?");
  });

  it("uses the first recognized goal when multiple are selected", () => {
    const copy = getGoalBannerCopy(["Improve Comprehension", "Increase Speed"]);
    expect(copy.headline).toBe("Ready to understand more?");
  });

  it("skips unrecognized entries and matches the first known goal", () => {
    const copy = getGoalBannerCopy(["Some Unknown Goal", "Enhance Focus"]);
    expect(copy.headline).toBe("Ready to lock in?");
  });

  it("falls back to generic copy for an empty goals array", () => {
    const copy = getGoalBannerCopy([]);
    expect(copy.headline).toBe("Ready to level up?");
  });

  it("falls back to generic copy for null/undefined goals", () => {
    expect(getGoalBannerCopy(null).headline).toBe("Ready to level up?");
    expect(getGoalBannerCopy(undefined).headline).toBe("Ready to level up?");
  });

  it("falls back to generic copy when nothing matches a known goal", () => {
    const copy = getGoalBannerCopy(["Totally Unknown"]);
    expect(copy.headline).toBe("Ready to level up?");
  });

  it("covers every goal offered at onboarding", () => {
    for (
      const goal of [
        "Increase Speed",
        "Improve Comprehension",
        "Enhance Focus",
        "Boost Retention",
      ]
    ) {
      expect(getGoalBannerCopy([goal]).headline).not.toBe(
        "Ready to level up?",
      );
    }
  });
});
