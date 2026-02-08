// functions/stats.ts

interface Env {
    ANALYTICS: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const today = new Date().toISOString().split("T")[0];

    const [downloadsToday, downloadsTotal, convertsToday, convertsTotal, visitsToday, visitsTotal] =
        await Promise.all([
            context.env.ANALYTICS.get(`count:${today}:download`),
            context.env.ANALYTICS.get("total:download"),
            context.env.ANALYTICS.get(`count:${today}:convert`),
            context.env.ANALYTICS.get("total:convert"),
            context.env.ANALYTICS.get(`count:${today}:visit`),
            context.env.ANALYTICS.get("total:visit"),
        ]);

    const html = `<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background: #0a0e27;
            min-height: 100vh;
            color: #fff;
            padding: 40px 20px;
        }
        .container { max-width: 900px; margin: 0 auto; }
        h1 { text-align: center; margin-bottom: 40px; }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .card {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 24px;
            text-align: center;
        }
        .card h2 { font-size: 0.9rem; color: #888; margin-bottom: 12px; }
        .card .number { font-size: 3rem; font-weight: bold; color: #667eea; }
        .section { margin: 40px 0; }
        .section h3 {
            color: #888;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Serbian Transliterator Analytics</h1>
        <div class="section">
            <h3>Danas (${today})</h3>
            <div class="grid">
                <div class="card"><h2>Posete</h2><div class="number">${visitsToday || "0"}</div></div>
                <div class="card"><h2>Konverzije</h2><div class="number">${convertsToday || "0"}</div></div>
                <div class="card"><h2>Preuzimanja</h2><div class="number">${downloadsToday || "0"}</div></div>
            </div>
        </div>
        <div class="section">
            <h3>Ukupno</h3>
            <div class="grid">
                <div class="card"><h2>Posete</h2><div class="number">${visitsTotal || "0"}</div></div>
                <div class="card"><h2>Konverzije</h2><div class="number">${convertsTotal || "0"}</div></div>
                <div class="card"><h2>Preuzimanja</h2><div class="number">${downloadsTotal || "0"}</div></div>
            </div>
        </div>
    </div>
</body>
</html>`;

    return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
};
