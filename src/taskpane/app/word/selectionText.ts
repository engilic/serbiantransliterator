// src/taskpane/app/word/selectionText.ts

export type SelectionTextAnalysis = {
    raw: string;
    trimmed: string;
    hasText: boolean;
    isEmpty: boolean;
    isJustWhitespace: boolean;
};

/**
 * Jedno mesto za logiku da li selekcija ima tekst / da li je samo whitespace.
 * Ovo se koristi i u runSmart() i u applyPipeline() i u applyFromPreview().
 *
 * Bitno: pure funkcija (bez Word/Office), tako da je testabilna u jsdom-u.
 */
export function analyzeSelectionText(rawText: string | null | undefined): SelectionTextAnalysis {
    const raw = String(rawText ?? "");
    const trimmed = raw.trim();

    const hasText = trimmed.length > 0;
    const isEmpty = raw.length === 0;
    const isJustWhitespace = !isEmpty && !hasText;

    return { raw, trimmed, hasText, isEmpty, isJustWhitespace };
}
