import { describe, expect, it } from "vitest";
import {
  getBionicBoldLength,
  splitBionicWord,
  tokenizeForBionic,
} from "./bionicReading";

describe("getBionicBoldLength", () => {
  it("bolds roughly half of the word, rounded up", () => {
    expect(getBionicBoldLength("reading")).toBe(4); // 7 -> ceil(3.5)
    expect(getBionicBoldLength("word")).toBe(2); // 4 -> ceil(2)
    expect(getBionicBoldLength("cat")).toBe(2); // 3 -> ceil(1.5)
  });

  it("leaves single-character and empty words untouched", () => {
    expect(getBionicBoldLength("a")).toBe(1);
    expect(getBionicBoldLength("")).toBe(0);
  });
});

describe("splitBionicWord", () => {
  it("splits into a bold prefix and the remainder", () => {
    expect(splitBionicWord("reading")).toEqual({ bold: "read", rest: "ing" });
  });

  it("reconstructs the original word when concatenated", () => {
    for (const word of ["a", "the", "reading", "comprehension", ""]) {
      const { bold, rest } = splitBionicWord(word);
      expect(bold + rest).toBe(word);
    }
  });

  it("bolds the whole word when it's a single character", () => {
    expect(splitBionicWord("I")).toEqual({ bold: "I", rest: "" });
  });
});

describe("tokenizeForBionic", () => {
  it("alternates word and whitespace tokens", () => {
    expect(tokenizeForBionic("the quick fox")).toEqual([
      { text: "the", isWhitespace: false },
      { text: " ", isWhitespace: true },
      { text: "quick", isWhitespace: false },
      { text: " ", isWhitespace: true },
      { text: "fox", isWhitespace: false },
    ]);
  });

  it("preserves multi-space and newline whitespace exactly", () => {
    const tokens = tokenizeForBionic("one\n\ntwo   three");
    expect(tokens.map((t) => t.text)).toEqual([
      "one",
      "\n\n",
      "two",
      "   ",
      "three",
    ]);
  });

  it("returns an empty array for empty text", () => {
    expect(tokenizeForBionic("")).toEqual([]);
  });

  it("reassembles to the original string", () => {
    const text = "  Leading and trailing text.  \nNext line.";
    const rebuilt = tokenizeForBionic(text).map((t) => t.text).join("");
    expect(rebuilt).toBe(text);
  });
});
