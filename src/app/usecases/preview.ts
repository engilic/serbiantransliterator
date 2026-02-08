// src/app/usecases/preview.ts

import type { DocumentAdapter } from "../ports/documentAdapter";
import type { Engine, EngineConvertInput } from "../ports/engine";
import type { SettingsStore } from "../ports/settingsStore";
import type { Telemetry } from "../ports/telemetry";
import type { PreviewResult, Result, Scope } from "../types";

type AppErrorCode = Extract<Result<never>, { ok: false }>["error"]["code"];

function err(code: AppErrorCode, message: string, cause?: unknown) {
    return { ok: false as const, error: { code, message, cause } };
}

export async function runPreview(args: {
    scope: Scope;
    adapter: DocumentAdapter;
    engine: Engine;
    settings: SettingsStore;
    telemetry: Telemetry;
}): Promise<Result<PreviewResult>> {
    const { scope, adapter, engine, settings, telemetry } = args;

    telemetry.track({ name: "preview_start", ts: Date.now(), props: { scope } });

    let selection;
    try {
        selection = await adapter.getSelection(scope);
    } catch (cause) {
        telemetry.track({ name: "preview_host_error", ts: Date.now(), props: { scope } });
        return err("HOST_ERROR", "Host nije uspeo da pročita selekciju/dokument.", cause);
    }

    // sanity checks
    if (selection.kind === "plainText" && String(selection.text ?? "").trim().length === 0) {
        telemetry.track({ name: "preview_no_selection", ts: Date.now(), props: { scope } });
        return err("NO_SELECTION", "Nema teksta za preview (prazno).");
    }
    if (selection.kind === "ooxml" && String(selection.xml ?? "").trim().length === 0) {
        telemetry.track({ name: "preview_no_selection", ts: Date.now(), props: { scope } });
        return err("NO_SELECTION", "Nema sadržaja za preview (prazan OOXML).");
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
        telemetry.track({ name: "preview_engine_error", ts: Date.now(), props: { scope } });
        return err("ENGINE_ERROR", "Engine nije uspeo da izvrši konverziju.", cause);
    }

    let beforeText = "";
    let afterText = "";
    try {
        beforeText = await engine.selectionToPreviewText(selection);
        afterText = await engine.convertedToPreviewText(converted);
    } catch (cause) {
        telemetry.track({ name: "preview_engine_error_preview_text", ts: Date.now(), props: { scope } });
        return err("ENGINE_ERROR", "Engine nije uspeo da pripremi preview tekst.", cause);
    }

    let diff;
    try {
        diff = await engine.diffText(beforeText, afterText);
    } catch (cause) {
        telemetry.track({ name: "preview_engine_error_diff", ts: Date.now(), props: { scope } });
        return err("ENGINE_ERROR", "Engine nije uspeo da izračuna diff.", cause);
    }

    const changeCount = engine.countChanges(diff);

    const preview: PreviewResult = {
        scope,
        selection,
        converted:
            converted.kind === "plainText"
                ? { kind: "plainText", text: converted.text }
                : {
                      kind: "ooxml",
                      xml: converted.xml,
                      context: selection.kind === "ooxml" ? selection.context : undefined,
                  },

        typeLabel: converted.typeLabel,
        beforeText,
        afterText,

        diff,
        changeCount,
        stats: converted.stats,
    };

    telemetry.track({
        name: "preview_done",
        ts: Date.now(),
        props: { scope, changeCount },
    });

    return { ok: true, value: preview };
}
