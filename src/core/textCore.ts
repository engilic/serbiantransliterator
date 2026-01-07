// src/core/textCore.ts (v3 + code blocks)

import { ALWAYS_LATIN_PHRASES, ALWAYS_LATIN_TOKENS } from "./rules";
import { applyPreCorrectionsLatToCyr } from "./corrections";
import { fixSerbianQuotes } from "./quotes";
import { collectProtectedRanges, splitByRanges } from "./protect";
import { cyrillicToLatin, detectMajorityScript, latinToCyrillic } from "./serbian";

export type Direction = "auto" | "lat-to-cyr" | "cyr-to-lat";

export interface CoreOptions {
  userProtected?: string[];
  protectBrands?: boolean;
  applySerbianQuotes?: boolean;

  /**
   * Default: true
   * Štiti inline/backtick i triple-backtick code blocks od preslovljavanja i navodnika.
   */
  preserveCodeBlocks?: boolean;
}

const normKey = (s: string) => s.normalize("NFC").toLowerCase();

const SR_ALLOWED = new Set(
  (
    "abcčćdđefghijklmnoprsštuvzž" +
    "ABCČĆDĐEFGHIJKLMNOPRSŠTUVZŽ" +
    "абвгдђежзијклљмнњопрстћуфхцчџш" +
    "АБВГДЂЕЖЗИЈКЛЉМНЊОПРСТЋУФХЦЧЏШ" +
    "0123456789-_'’"
  ).split("")
);

const STRONG_FOREIGN = /[QWXYqwxy]/;

const ROMAN = /^[IVXLCDM]+$/;
const RULERS = new Set(
  [
    "petar","aleksandar","nikola","milan","đorđe","jovan","uroš","stefan","lazar","luj","čarls","elizabeta","filip",
    "papa","pavle","patrijarh","tom","grupa","zona","korpus","armija","deo","knjiga","stav","član","sprat"
  ]
);
const CATEGORY_PREFIX = [
  "razred","kategorij","grupa","zona","korpus","armija","deo","tom","knjiga","stav","član","svetski","sprat","vek","rat"
];

function hasForeignLetter(token: string): boolean {
  for (const ch of token) {
    if (/\p{L}/u.test(ch) && !SR_ALLOWED.has(ch)) return true;
  }
  return false;
}

function isMixedCaseBrandy(token: string): boolean {
  return /[a-zčćđšž]+[A-ZČĆĐŠŽ]/.test(token);
}

function isHashLike(token: string): boolean {
  return token.length > 6 && /^\d/.test(token) && /[A-Za-z]/.test(token);
}

type Tok = { type: "word" | "other"; value: string };

function isLetterOrDigit(ch: string): boolean {
  return /\p{L}|\p{N}/u.test(ch);
}

function tokenize(text: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;

  const push = (type: Tok["type"], value: string) => {
    if (!value) return;
    const last = out[out.length - 1];
    if (last && last.type === type) last.value += value;
    else out.push({ type, value });
  };

  while (i < text.length) {
    const ch = text[i]!;
    const prev = i > 0 ? text[i - 1] : "";
    const next = i + 1 < text.length ? text[i + 1] : "";

    const isJoiner =
      ch === "-" ||
      ch === "‑" || ch === "‐" || ch === "‒" || ch === "–" || ch === "—" ||
      ch === "'" || ch === "’" ||
      ch === "." || ch === "+" || ch === "#" || ch === "/";

    const joinerOk =
      isJoiner &&
      (
        (ch === "." && (isLetterOrDigit(next) || (isLetterOrDigit(prev) && isLetterOrDigit(next)))) ||
        ((ch === "+" || ch === "#") && (isLetterOrDigit(prev) || isLetterOrDigit(next))) ||
        (ch === "/" && isLetterOrDigit(prev) && isLetterOrDigit(next)) ||
        ((ch === "-" || ch === "‑" || ch === "‐" || ch === "‒" || ch === "–" || ch === "—" || ch === "'" || ch === "’") &&
          (isLetterOrDigit(prev) || isLetterOrDigit(next)))
      );

    if (isLetterOrDigit(ch) || joinerOk) {
      push("word", ch);
    } else {
      push("other", ch);
    }

    i++;
  }

  return out;
}

function prevNextWord(tokens: Tok[], idx: number): { prev?: string; next?: string } {
  let prev: string | undefined;
  let next: string | undefined;

  for (let i = idx - 1; i >= 0; i--) {
    if (tokens[i]!.type === "word") { prev = tokens[i]!.value; break; }
  }
  for (let i = idx + 1; i < tokens.length; i++) {
    if (tokens[i]!.type === "word") { next = tokens[i]!.value; break; }
  }

  return { prev, next };
}

function shouldProtectRomanToken(tokens: Tok[], idx: number): boolean {
  const t = tokens[idx]!;
  if (t.type !== "word") return false;

  const v = t.value;
  if (!ROMAN.test(v)) return false;
  if (v !== v.toUpperCase()) return false;
  if (v.length > 8) return false;

  const { prev, next } = prevNextWord(tokens, idx);
  const prevKey = prev ? normKey(prev) : "";
  const nextKey = next ? normKey(next) : "";

  if (prevKey && RULERS.has(prevKey)) return true;
  if (nextKey && CATEGORY_PREFIX.some((p) => nextKey.startsWith(p))) return true;

  return false;
}

export function detectScript(text: string): "latin" | "cyrillic" {
  return detectMajorityScript(text);
}

function convertUnprotectedSegment(
  segment: string,
  toCyrillic: boolean,
  options?: CoreOptions
): string {
  const userProtected = options?.userProtected ?? [];
  const protectBrands = options?.protectBrands !== false;

  const toks = tokenize(segment);
  let out = "";

  for (let i = 0; i < toks.length; i++) {
    const t = toks[i]!;
    if (t.type !== "word") {
      out += t.value;
      continue;
    }

    const tok = t.value;

    if (userProtected.includes(tok)) {
      out += tok;
      continue;
    }

    if (toCyrillic && shouldProtectRomanToken(toks, i)) {
      out += tok;
      continue;
    }

    if (protectBrands && ALWAYS_LATIN_TOKENS.has(normKey(tok))) {
      out += tok;
      continue;
    }

    if (STRONG_FOREIGN.test(tok)) {
      out += tok;
      continue;
    }

    if (hasForeignLetter(tok)) {
      out += tok;
      continue;
    }

    if (isMixedCaseBrandy(tok)) {
      out += tok;
      continue;
    }

    if (isHashLike(tok)) {
      out += tok;
      continue;
    }

    out += toCyrillic ? latinToCyrillic(tok) : cyrillicToLatin(tok);
  }

  return out;
}

export function convertPlainText(
  text: string,
  direction: Direction = "auto",
  options?: CoreOptions
): { text: string; type: string } {
  if (!text.trim()) return { text, type: "Nema teksta" };

  const protectBrands = options?.protectBrands !== false;
  const preserveCodeBlocks = options?.preserveCodeBlocks !== false;
  const userProtected = options?.userProtected ?? [];

  let toCyr: boolean;
  let label: string;

  if (direction === "auto") {
    const script = detectMajorityScript(text);
    toCyr = script === "latin";
    label = toCyr ? "Lat → Ćir" : "Ćir → Lat";
  } else if (direction === "lat-to-cyr") {
    toCyr = true;
    label = "Lat → Ćir";
  } else {
    toCyr = false;
    label = "Ćir → Lat";
  }

  const userProtectedPhrases = userProtected.filter((x) => /\s/.test(x));

  const protectedRanges = collectProtectedRanges(text, {
    protectBrands,
    brandPhrases: protectBrands ? ALWAYS_LATIN_PHRASES : [],
    userProtectedPhrases,
    preserveCodeBlocks,
  });

  const parts = splitByRanges(text, protectedRanges);

  const outParts: string[] = [];
  for (const part of parts) {
    if (part.protected) {
      outParts.push(part.text);
      continue;
    }

    let seg = part.text.normalize("NFC");

    if (toCyr) seg = applyPreCorrectionsLatToCyr(seg);

    seg = convertUnprotectedSegment(seg, toCyr, options);

    if (toCyr && options?.applySerbianQuotes !== false) {
      seg = fixSerbianQuotes(seg);
    }

    outParts.push(seg);
  }

  return { text: outParts.join(""), type: label };
}