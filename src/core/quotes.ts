// src/core/quotes.ts

export function fixSerbianQuotes(segment: string): string {
  let text = segment;

  // sve quote varijante -> "
  text = text.replace(/[“”‘’«»„‟‚‛‹›]/g, `"`);

  // opening
  text = text.replace(/(^|[\s(\[{<\-–—])"/g, `$1„`);

  // closing (sve preostale)
  text = text.replace(/"/g, "”");

  return text;
}