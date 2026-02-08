// src/app/types.ts

export type Direction = "auto" | "lat-to-cyr" | "cyr-to-lat" | "to-ascii";
export type Scope = "selection" | "document";

export interface OoxmlSelectionContext {
    opaque?: unknown;
}

export type DocumentSelection =
    | { kind: "plainText"; text: string }
    | { kind: "ooxml"; xml: string; context?: OoxmlSelectionContext };

export type ApplyEdits =
    | { kind: "replacePlainText"; text: string }
    | { kind: "replaceOoxml"; xml: string; context?: OoxmlSelectionContext }
    | { kind: "hostPipeline" };

export type DiffOpType = "equal" | "insert" | "delete";
export type DiffOp = { type: DiffOpType; value: string };

export interface PreviewResult {
    scope: Scope;

    selection: DocumentSelection;
    converted: DocumentSelection;

    /** label tipa: "Lat → Ćir", "Ćir → Lat", "Ošišana latinica", ... */
    typeLabel: string;

    /** user-visible preview tekstovi (za modal + diff rendering) */
    beforeText: string;
    afterText: string;

    diff: DiffOp[];
    changeCount: number;

    /** engine može vratiti i stats (ConvertStats za OOXML), tip držimo fleksibilno */
    stats?: unknown;
}

export interface ApplyResult {
    scope: Scope;
    changeCount: number;

    typeLabel?: string;
    timingMs?: number;
    stats?: unknown;
}

export type AppErrorCode = "NO_SELECTION" | "UNSUPPORTED_SELECTION_KIND" | "ENGINE_ERROR" | "HOST_ERROR";

export interface AppError {
    code: AppErrorCode;
    message: string;
    cause?: unknown;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: AppError };
