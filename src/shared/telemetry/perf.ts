// src/shared/telemetry/perf.ts

export const perf = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    record: (_name: string, _count: number, _ms: number, _meta?: unknown) => {
        // no-op (web-safe, addin-safe)
    },
};
