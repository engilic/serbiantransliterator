// src/taskpane/officeRuntime.ts

export type OfficeRuntimeLike = Pick<typeof Office, "onReady">;

function isRecord(x: unknown): x is Record<string, unknown> {
    return typeof x === "object" && x !== null;
}

export function isOfficeRuntimeLike(x: unknown): x is OfficeRuntimeLike {
    if (!isRecord(x)) return false;
    return typeof x["onReady"] === "function";
}

export function getOfficeRuntime(): OfficeRuntimeLike | null {
    const g = globalThis as typeof globalThis & { Office?: unknown };
    const fromGlobal: unknown = g.Office;

    if (isOfficeRuntimeLike(fromGlobal)) return fromGlobal;

    if (typeof window !== "undefined") {
        const w = window as Window & { Office?: unknown };
        const fromWindow: unknown = w.Office;
        if (isOfficeRuntimeLike(fromWindow)) return fromWindow;
    }

    return null;
}
