// src/shared/normalizeError.ts

export interface NormalizedError {
    name: string;
    message: string;
    stack?: string;
    details?: Record<string, unknown>;
}

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null;
}

function readStringProp(obj: Record<string, unknown>, key: string): string | undefined {
    const v = obj[key];
    return typeof v === "string" ? v : undefined;
}

function readNumberProp(obj: Record<string, unknown>, key: string): number | undefined {
    const v = obj[key];
    return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function readBooleanProp(obj: Record<string, unknown>, key: string): boolean | undefined {
    const v = obj[key];
    return typeof v === "boolean" ? v : undefined;
}

/**
 * Normalize an unknown error shape into a stable, human-readable form.
 * Primary goal: never produce "[object Event]" or other unhelpful implicit stringifications.
 */
export function normalizeUnknownError(error: unknown, fallbackMessage = "Unknown error"): NormalizedError {
    try {
        if (error instanceof Error) {
            const message =
                error.message && error.message.trim().length > 0 ? error.message : fallbackMessage;
            return {
                name: error.name || "Error",
                message,
                stack: error.stack,
            };
        }

        if (typeof error === "string") {
            const message = error.trim().length > 0 ? error : fallbackMessage;
            return { name: "Error", message };
        }

        if (error === null || error === undefined) {
            return { name: "Error", message: fallbackMessage };
        }

        if (
            typeof error === "number" ||
            typeof error === "boolean" ||
            typeof error === "bigint" ||
            typeof error === "symbol"
        ) {
            return { name: "Error", message: String(error) };
        }

        if (typeof error === "function") {
            return { name: "Error", message: "Function thrown as error" };
        }

        if (isRecord(error)) {
            const name = readStringProp(error, "name");
            const messageProp = readStringProp(error, "message");
            const typeProp = readStringProp(error, "type");

            // ErrorEvent-like (common for worker.onerror / window.onerror)
            const filename = readStringProp(error, "filename");
            const lineno = readNumberProp(error, "lineno");
            const colno = readNumberProp(error, "colno");
            const nested = error["error"];

            const looksLikeErrorEvent =
                typeProp === "error" ||
                (typeof filename === "string" && filename.length > 0) ||
                typeof lineno === "number" ||
                typeof colno === "number";

            if (looksLikeErrorEvent) {
                const details: Record<string, unknown> = {};
                if (typeProp) details.type = typeProp;
                if (filename) details.filename = filename;
                if (typeof lineno === "number") details.lineno = lineno;
                if (typeof colno === "number") details.colno = colno;

                if (nested !== undefined) {
                    const nestedNorm = normalizeUnknownError(nested, fallbackMessage);
                    details.nested = {
                        name: nestedNorm.name,
                        message: nestedNorm.message,
                    };
                }

                const message =
                    (messageProp && messageProp.trim().length > 0 ? messageProp : null) ??
                    (typeProp ? `ErrorEvent: ${typeProp}` : fallbackMessage);

                return {
                    name: name || "ErrorEvent",
                    message,
                    details,
                };
            }

            // Generic Event-like object (common for messageerror, etc.)
            if (typeProp) {
                const details: Record<string, unknown> = {};
                const isTrusted = readBooleanProp(error, "isTrusted");
                if (typeof isTrusted === "boolean") details.isTrusted = isTrusted;

                return {
                    name: name || "Event",
                    message: `Event: ${typeProp}`,
                    details,
                };
            }

            // "Error-like" plain object: { message, name?, stack? }
            if (messageProp) {
                const stackProp = readStringProp(error, "stack");
                return {
                    name: name || "Error",
                    message: messageProp,
                    stack: stackProp,
                };
            }

            // Last resort: try to JSON-stringify. If it fails, produce stable message.
            try {
                const json = JSON.stringify(error);
                if (json && json !== "{}") {
                    return { name: name || "Error", message: json };
                }
            } catch {
                // ignore
            }

            return { name: name || "Error", message: fallbackMessage };
        }

        return { name: "Error", message: fallbackMessage };
    } catch {
        return { name: "Error", message: fallbackMessage };
    }
}
