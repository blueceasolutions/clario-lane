import { describe, expect, it } from "vitest";
import { generateProgressCsv, type ExportableSession } from "./exportReport";

describe("generateProgressCsv", () => {
  it("produces a header row plus one row per session", () => {
    const sessions: ExportableSession[] = [
      {
        created_at: "2026-08-10T14:30:00.000Z",
        wpm: 250,
        comprehension: 90,
        total_words: 500,
        duration: 120,
      },
    ];

    const csv = generateProgressCsv(sessions);
    const lines = csv.split("\n");

    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(
      "Date,WPM,Comprehension (%),Words Read,Duration (min),Effective WPM",
    );
    expect(lines[1]).toBe("2026-08-10,250,90,500,2,225");
  });

  it("handles missing optional fields with sensible defaults", () => {
    const sessions: ExportableSession[] = [
      {
        created_at: null,
        wpm: 200,
        comprehension: 80,
        total_words: null,
        duration: null,
      },
    ];

    const csv = generateProgressCsv(sessions);
    expect(csv.split("\n")[1]).toBe(",200,80,0,0,160");
  });

  it("returns just the header for no sessions", () => {
    const csv = generateProgressCsv([]);
    expect(csv.split("\n")).toHaveLength(1);
  });
});
