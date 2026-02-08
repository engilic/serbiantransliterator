// src/app/ports/telemetry.ts

export interface TelemetryEvent {
    name: string;
    ts: number; // Date.now()
    props?: Record<string, string | number | boolean | null>;
}

export interface Telemetry {
    track(ev: TelemetryEvent): void;
}

export class NoopTelemetry implements Telemetry {
    track(_ev: TelemetryEvent): void {
        // no-op
    }
}
