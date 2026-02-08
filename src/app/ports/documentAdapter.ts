// src/app/ports/documentAdapter.ts

import type { ApplyEdits, DocumentSelection, Scope } from "../types";

export interface HostCapabilities {
    /**
     * Da li host može bezbedno da menja ceo dokument (ne samo selekciju).
     */
    canApplyToDocument: boolean;

    /**
     * Da li host može da radi sa OOXML (Word najčešće da; web zavisi).
     */
    supportsOoxml: boolean;

    /**
     * Da li host ima native undo (Word ima), ili treba snapshot mehanizam.
     */
    hasNativeUndo: boolean;
}

/**
 * Adapter je jedina tačka gde app sloj “priča” sa hostom (Office ili Web).
 * UI poziva controller, controller poziva adapter.
 * App sloj NIKAD ne importuje office.js ili DOM.
 */
export interface DocumentAdapter {
    getSelection(scope: Scope): Promise<DocumentSelection>;

    /**
     * Apply je host-responsibility: Word adapter zna kako da uradi pipeline/chunking/etc.
     * Web adapter zna kako da ažurira editor/doc model ili export fajl.
     */
    apply(scope: Scope, edits: ApplyEdits): Promise<void>;

    capabilities(): HostCapabilities;
}
