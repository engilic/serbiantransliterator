// src/app/usecases/apply.ts

import type { DocumentAdapter } from "../ports/documentAdapter";
import type { Engine, EngineConvertInput } from "../ports/engine";
import type { SettingsStore } from "../ports/settingsStore";
import type { Telemetry } from "../ports/telemetry";
import type { ApplyResult, ApplyEdits, Result, Scope } from "../types";

type AppErrorCode = Extract<Result<never>, { ok: false }>["error"]["code"];

function err(code: AppErrorCode, message: string, cause?: unknown) {
    return { ok: false as const, error: { code, message, cause } };
}

function readTimingMs(stats: unknown): number | undefined {
    if (!stats || typeof stats !== "object") return undefined;
    const rec = stats as Record<string, unknown>;
    const v = rec["timingMs"];
    return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

export async function runApply(args: {
    scope: Scope;
    adapter: DocumentAdapter;
    engine: Engine;
    settings: SettingsStore;
    telemetry: Telemetry;
}): Promise<Result<ApplyResult>> {
    const { scope, adapter, engine, settings, telemetry } = args;

    telemetry.track({ name: "apply_start", ts: Date.now(), props: { scope } });

    // Whole document: delegate to host pipeline
    if (scope === "document" && adapter.capabilities().canApplyToDocument) {
        try {
            await adapter.apply(scope, { kind: "hostPipeline" });
            telemetry.track({ name: "apply_done", ts: Date.now(), props: { scope, changeCount: 0 } });
            return { ok: true, value: { scope, changeCount: 0 } };
        } catch (cause) {
            telemetry.track({ name: "apply_host_error", ts: Date.now(), props: { scope } });
            return err("HOST_ERROR", "Host nije uspeo da primeni izmene (document pipeline).", cause);
        }
    }

    // Selection
    let selection;
    try {
        selection = await adapter.getSelection(scope);
    } catch (cause) {
        telemetry.track({ name: "apply_host_error", ts: Date.now(), props: { scope } });
        return err("HOST_ERROR", "Host nije uspeo da pročita selekciju.", cause);
    }

    const s = await settings.get();

    let converted;
    try {
        const input: EngineConvertInput =
            selection.kind === "plainText"
                ? {
                      kind: "plainText",
                      text: selection.text,
                      direction: s.direction,
                      options: s.engineOptions,
                  }
                : {
                      kind: "ooxml",
                      xml: selection.xml,
                      direction: s.direction,
                      options: s.engineOptions,
                  };

        converted = await engine.convert(input);
    } catch (cause) {
        telemetry.track({ name: "apply_engine_error", ts: Date.now(), props: { scope } });
        return err("ENGINE_ERROR", "Engine nije uspeo da izvrši konverziju.", cause);
    }

    // Change count (best-effort)
    let changeCount = 0;
    try {
        const beforeText = await engine.selectionToPreviewText(selection);
        const afterText = await engine.convertedToPreviewText(converted);
        const diff = await engine.diffText(beforeText, afterText);
        changeCount = engine.countChanges(diff);
    } catch {
        changeCount = 0;
    }

    const edits: ApplyEdits =
        converted.kind === "plainText"
            ? { kind: "replacePlainText", text: converted.text }
            : {
                  kind: "replaceOoxml",
                  xml: converted.xml,
                  context: selection.kind === "ooxml" ? selection.context : undefined,
              };

    try {
        await adapter.apply(scope, edits);
    } catch (cause) {
        telemetry.track({ name: "apply_host_error", ts: Date.now(), props: { scope } });
        return err("HOST_ERROR", "Host nije uspeo da primeni izmene.", cause);
    }

    telemetry.track({ name: "apply_done", ts: Date.now(), props: { scope, changeCount } });

    return {
        ok: true,
        value: {
            scope,
            changeCount,
            typeLabel: converted.typeLabel,
            timingMs: readTimingMs(converted.stats),
            stats: converted.stats,
        },
    };
}
