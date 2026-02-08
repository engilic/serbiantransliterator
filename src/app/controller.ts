// src/app/controller.ts

import type { DocumentAdapter } from "./ports/documentAdapter";
import type { Engine } from "./ports/engine";
import type { SettingsStore } from "./ports/settingsStore";
import type { Telemetry } from "./ports/telemetry";
import type { PreviewResult, Result, Scope } from "./types";

import { runApply } from "./usecases/apply";
import { runPreview } from "./usecases/preview";

export interface AppController {
    preview(scope: Scope): Promise<Result<PreviewResult>>;
    apply(scope: Scope): ReturnType<typeof runApply>;

    getCapabilities(): ReturnType<DocumentAdapter["capabilities"]>;

    getSettings(): ReturnType<SettingsStore["get"]>;
    setSettings(patch: Parameters<SettingsStore["set"]>[0]): Promise<void>;
}

export function createAppController(args: {
    adapter: DocumentAdapter;
    engine: Engine;
    settings: SettingsStore;
    telemetry: Telemetry;
}): AppController {
    const { adapter, engine, settings, telemetry } = args;

    return {
        preview: (scope) => runPreview({ scope, adapter, engine, settings, telemetry }),
        apply: (scope) => runApply({ scope, adapter, engine, settings, telemetry }),

        getCapabilities: () => adapter.capabilities(),

        getSettings: () => settings.get(),
        setSettings: (patch) => settings.set(patch),
    };
}
