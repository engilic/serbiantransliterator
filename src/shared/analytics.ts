// src/shared/analytics.ts

export function track(event: string, data?: Record<string, unknown>): void {
    try {
        const payload = JSON.stringify({ event, data });

        if (navigator.sendBeacon) {
            navigator.sendBeacon("/track", payload);
        } else {
            fetch("/track", {
                method: "POST",
                body: payload,
                keepalive: true,
            }).catch(() => {});
        }
    } catch {
        void 0;
    }
}
