// src/shared/patterns/common.ts
/**
 * Znakovi interpunkcije koji se često lepe za kraj URL-a ili reči,
 * a ne želimo da budu deo linka.
 *
 * NAMERNO ne uključuje: ) ] }
 * jer te zatvarajuće zagrade mogu biti validan deo URL-a (npr. Wikipedia),
 * pa ih skidamo "balansirano" u trimLinkEnd().
 */
export const PUNCTUATION_CHARS = ".,;:!?";

/**
 * Regex koji hvata jedan ili više znakova interpunkcije na kraju stringa.
 */
export const PUNCTUATION_END_REGEX = new RegExp(`[${PUNCTUATION_CHARS}]+$`, "g");

/**
 * Zatvarajuće zagrade koje ponekad jesu validan deo URL-a,
 * pa ih skidamo samo ako su "višak" (nebalansirane).
 */
export const BALANCED_CLOSERS = [")", "]", "}"] as const;

export const CLOSER_TO_OPENER: Record<(typeof BALANCED_CLOSERS)[number], string> = {
    ")": "(",
    "]": "[",
    "}": "{",
};
