// functions/track.ts

interface Env {
    ANALYTICS: KVNamespace;
}

interface TrackingEvent {
    event: string;
    data?: Record<string, unknown>;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Content-Type": "application/json",
    };

    try {
        const body = (await context.request.json()) as TrackingEvent;
        const event = body.event || "unknown";

        const today = new Date().toISOString().split("T")[0];
        const countKey = count:${today}:${event};

        const currentCount = await context.env.ANALYTICS.get(countKey);
        const newCount = (parseInt(currentCount || "0", 10) + 1).toString();
        await context.env.ANALYTICS.put(countKey, newCount);

        const totalKey = 	otal:${event};
        const currentTotal = await context.env.ANALYTICS.get(totalKey);
        const newTotal = (parseInt(currentTotal || "0", 10) + 1).toString();
        await context.env.ANALYTICS.put(totalKey, newTotal);

        return new Response(JSON.stringify({ success: true, count: newCount }), {
            status: 200,
            headers,
        });
    } catch (e) {
        return new Response(JSON.stringify({ success: false }), {
            status: 400,
            headers,
        });
    }
};

export const onRequestOptions: PagesFunction = async () => {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
};
