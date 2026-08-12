// Bionic reading: bold roughly the first half of each word so the eye can
// complete short, familiar words from the bolded prefix alone, reducing
// fixation time. This is the pure text-splitting logic; DisplayText.tsx
// turns the result into JSX.

export type BionicWordParts = {
  bold: string;
  rest: string;
};

export function getBionicBoldLength(word: string): number {
  if (word.length <= 1) return word.length;
  return Math.ceil(word.length * 0.5);
}

export function splitBionicWord(word: string): BionicWordParts {
  const boldLength = getBionicBoldLength(word);
  return {
    bold: word.slice(0, boldLength),
    rest: word.slice(boldLength),
  };
}

export type BionicToken = {
  text: string;
  isWhitespace: boolean;
};

// Splits text into alternating word/whitespace tokens, preserving the
// original whitespace exactly (including newlines) so the caller can
// reassemble it without reformatting the passage.
export function tokenizeForBionic(text: string): BionicToken[] {
  if (!text) return [];
  return text
    .split(/(\s+)/)
    .filter((token) => token.length > 0)
    .map((token) => ({
      text: token,
      isWhitespace: /^\s+$/.test(token),
    }));
}
