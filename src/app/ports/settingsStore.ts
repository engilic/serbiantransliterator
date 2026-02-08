// src/app/ports/settingsStore.ts

import type { Direction } from "../types";

export interface AppSettings {
    direction: Direction;
    engineOptions: Record<string, unknown>;
}

export interface SettingsStore {
    get(): Promise<AppSettings>;
    set(patch: Partial<AppSettings>): Promise<void>;
}

export class MemorySettingsStore implements SettingsStore {
    private state: AppSettings;

    constructor(initial?: Partial<AppSettings>) {
        this.state = {
            direction: "auto",
            engineOptions: {},
            ...initial,
        };
    }

    async get(): Promise<AppSettings> {
        return this.state;
    }

    async set(patch: Partial<AppSettings>): Promise<void> {
        this.state = { ...this.state, ...patch };
    }
}
