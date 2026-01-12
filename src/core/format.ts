// src/core/format.ts

export function formatSerbianDates(text: string): string {
  let out = text.replace(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g, "$2.$1.$3.");
  out = out.replace(/\b(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})\.?/g, "$1.$2.$3.");
  out = out.replace(/\b(\d{1,2})\.\s*(\d{1,2})\.(?!\d)/g, "$1.$2.");
  return out;
}

export function toAscii(text: string): string {
  const map: Record<string, string> = {
    č: "c",
    ć: "c",
    š: "s",
    đ: "dj",
    ž: "z",
    Č: "C",
    Ć: "C",
    Š: "S",
    Đ: "Dj",
    Ž: "Z",
  };
  return text.replace(/[čćšđžČĆŠĐŽ]/g, (m) => map[m]!);
}