// src/app/integrations/office/createOfficeController.ts

import { createAppController } from "../../controller";
import type { SettingsStore, AppSettings } from "../../ports/settingsStore";
import { NoopTelemetry } from "../../ports/telemetry";
import { createSerbianEngine } from "../../engine/serbianEngine";
import { OfficeDocumentAdapter } from "../../adapters/office/officeDocumentAdapter";

import { getOoxmlOptionsFromUi } from "../../../taskpane/app/settings/getters";

class OfficeUiSettingsStore implements SettingsStore {
    async get(): Promise<AppSettings> {
        const opts = getOoxmlOptionsFromUi();
        const direction = (opts.direction ?? "auto") as AppSettings["direction"];

        return {
            direction,
            engineOptions: opts as unknown as Record<string, unknown>,
        };
    }

    async set(_patch: Partial<AppSettings>): Promise<void> {
        // read-only for now
    }
}

export function createOfficeController() {
    const adapter = new OfficeDocumentAdapter();
    const engine = createSerbianEngine();
    const settings = new OfficeUiSettingsStore();
    const telemetry = new NoopTelemetry();

    return createAppController({ adapter, engine, settings, telemetry });
}
