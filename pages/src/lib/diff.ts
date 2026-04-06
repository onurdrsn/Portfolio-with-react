// HTML-aware or newline-based LCS diff, one entry per logical "block"
export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  value: string;
  origLine: number | null;
  newLine: number | null;
}

/** Normalize a string for COMPARISON only (not for output).
 *  Handles Windows line endings, curly quotes, Unicode dashes, etc. */
function normalizeForCompare(s: string): string {
  return s
    .replace(/\r/g, "")            // Windows \r\n → \n
    .trimEnd()                      // trailing whitespace
    .replace(/[\u2018\u2019]/g, "'")   // curly apostrophes → straight
    .replace(/[\u201C\u201D]/g, '"')   // curly double quotes → straight
    .replace(/\u2026/g, "...")         // ellipsis character → ...
    .replace(/[\u2013\u2014]/g, "-")  // en/em dash → hyphen
    .replace(/\u00A0/g, " ")          // non-breaking space → regular space
    .replace(/\u200B/g, "");          // zero-width space → removed
}

/** Split content into diffable units.
 *  - HTML (Quill output): every closing block tag is a boundary.
 *  - Markdown / plain text: split by newline. */
export function splitContent(raw: string): { parts: string[]; isHtml: boolean } {
  const trimmed = raw.trimStart().replace(/\r/g, "");
  const isHtml = trimmed.startsWith("<");

  if (isHtml) {
    const parts = raw
      .replace(/\r/g, "")
      .split(/(?<=<\/(?:p|h[1-6]|li|ul|ol|blockquote|pre|div|table|tr|thead|tbody|figure|section|article|header|footer)\s*>)/i)
      .map((s) => s.trim())
      .filter(Boolean);
    return { parts: parts.length > 1 ? parts : [raw], isHtml: true };
  }

  return { parts: trimmed.split("\n"), isHtml: false };
}

export function joinContent(lines: string[], isHtml: boolean): string {
  return isHtml ? lines.join("") : lines.join("\n");
}

export function diffLines(original: string, revised: string): DiffLine[] {
  const { parts: a, isHtml } = splitContent(original);
  const { parts: b } = splitContent(revised);

  const m = a.length;
  const n = b.length;

  // LCS matrix — compare using normalized strings but keep original values
  const aNorm = a.map(normalizeForCompare);
  const bNorm = b.map(normalizeForCompare);

  const matrix: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      matrix[i][j] =
        aNorm[i - 1] === bNorm[j - 1]
          ? matrix[i - 1][j - 1] + 1
          : Math.max(matrix[i - 1][j], matrix[i][j - 1]);
    }
  }

  // Backtrack
  let i = m;
  let j = n;
  type Raw = { type: "added" | "removed" | "unchanged"; aIdx: number | null; bIdx: number | null; value: string };
  const raw: Raw[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aNorm[i - 1] === bNorm[j - 1]) {
      raw.unshift({ type: "unchanged", aIdx: i - 1, bIdx: j - 1, value: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
      raw.unshift({ type: "added", aIdx: null, bIdx: j - 1, value: b[j - 1] });
      j--;
    } else {
      raw.unshift({ type: "removed", aIdx: i - 1, bIdx: null, value: a[i - 1] });
      i--;
    }
  }

  // Assign human-readable line numbers
  let origCounter = 1;
  let newCounter = 1;

  return raw.map((entry) => {
    let origLine: number | null = null;
    let newLine: number | null = null;

    if (entry.type === "unchanged") {
      origLine = origCounter++;
      newLine = newCounter++;
    } else if (entry.type === "removed") {
      origLine = origCounter++;
    } else {
      newLine = newCounter++;
    }

    return { type: entry.type, value: entry.value, origLine, newLine };
  });
}

// Legacy alias
export type DiffChunk = DiffLine;
