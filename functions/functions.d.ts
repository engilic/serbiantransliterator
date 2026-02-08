// functions/functions.d.ts

// Type definitions for Cloudflare Pages Functions

declare global {
    interface KVNamespace {
        get(key: string): Promise<string | null>;
        put(key: string, value: string): Promise<void>;
        delete(key: string): Promise<void>;
        list(options?: { prefix?: string }): Promise<{ keys: Array<{ name: string }> }>;
    }

    interface PagesContext<Env = unknown> {
        request: Request;
        env: Env;
        params: Record<string, string>;
        waitUntil(promise: Promise<unknown>): void;
        next(): Promise<Response>;
    }

    type PagesFunction<Env = unknown> = (context: PagesContext<Env>) => Response | Promise<Response>;
}

export {};
