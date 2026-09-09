// Pure string-matching helpers — no DB/framework dependency, so this can be
// unit-testable and reused anywhere a "did you mean...?" style typo-tolerant
// match is useful.

// Classic dynamic-programming edit distance — how many single-character
// insertions/deletions/substitutions turn `a` into `b`.
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prevRow = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const currRow = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        currRow[j - 1] + 1, // insertion
        prevRow[j] + 1, // deletion
        prevRow[j - 1] + cost // substitution
      );
    }
    prevRow = currRow;
  }
  return prevRow[n];
}

// Typo tolerance scales with word length — a short word allows no slack
// (otherwise almost anything "matches"), longer words allow progressively
// more since a real misspelling has more room to land in.
function maxAllowedDistance(wordLength) {
  if (wordLength <= 4) return 1;
  if (wordLength <= 8) return 2;
  return 3;
}

// Words under 3 letters ("a", "to", "in", "for"...) are dropped — they carry
// almost no distinguishing signal, and worse, they're near-guaranteed to
// turn up as a coincidental substring of *any* longer query (e.g. the
// standalone word "a" is trivially "contained" in "agricultural"), which
// would otherwise make unrelated products look like exact matches below.
function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3);
}

// Lower is a closer match; Infinity means nothing in `text` is within typo
// range of any word in `query`. Compares every query word against every
// text word so both "agricultureal" -> "Agricultural Products" (one
// misspelled word) and multi-word queries work.
export function fuzzyScore(query, text) {
  const queryWords = tokenize(query);
  const textWords = tokenize(text);

  let best = Infinity;
  for (const q of queryWords) {
    for (const w of textWords) {
      // Containment (plurals, partial typing) only counts as an exact hit
      // once the shorter side is long enough that it can't just be a
      // coincidental substring of the other.
      const shorter = Math.min(q.length, w.length);
      if (shorter >= 4 && (w.includes(q) || q.includes(w))) return 0;

      const distance = levenshtein(q, w);
      if (distance <= maxAllowedDistance(Math.max(q.length, w.length)) && distance < best) {
        best = distance;
      }
    }
  }
  return best;
}
