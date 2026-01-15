// src/core/utils.ts

/**
 * Uklanja višak razmaka (konzervativno):
 * - Zameni sve "čudne" razmake običnim razmakom
 * - Po liniji: čuva indent (vodeće) i trailing razmake (tačno koliko ih ima)
 * - U "telu" linije:
 *   - 2 razmaka -> 1
 *   - 3+ razmaka -> 2  (da ne ubiješ poravnanja iz copy/paste-a)
 * - Višestruke prazne linije svodi na najviše 2 zaredom
 */
export function removeMultipleSpaces(text: string): string {
    // 1) Normalize "weird spaces" -> regular space
    let out = (text ?? "").replace(/[\t\u00A0\u1680-\u200a\u2028\u2029\u202f\u205f\u3000]/g, " ");

    // 2) Normalize newlines (defensive)
    out = out.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // 3) Limit multiple blank lines
    out = out.replace(/\n{3,}/g, "\n\n");

    // 4) Per-line normalize spaces, preserving leading/trailing spaces exactly
    const lines = out.split("\n");
    const fixed = lines.map((line) => {
        if (!line) return line;

        // if the whole line is spaces, keep it as-is
        if (line.trim().length === 0) return line;

        const leadMatch = line.match(/^ +/);
        const trailMatch = line.match(/ +$/);

        const lead = leadMatch ? leadMatch[0] : "";
        const trail = trailMatch ? trailMatch[0] : "";

        const core = line.slice(lead.length, line.length - trail.length);

        // Replace only in the "core":
        // - exactly 2 spaces => 1
        // - 3+ spaces => 2
        const coreFixed = core.replace(/ {2,}/g, (m) => (m.length === 2 ? " " : "  "));

        return lead + coreFixed + trail;
    });

    return fixed.join("\n");
}
