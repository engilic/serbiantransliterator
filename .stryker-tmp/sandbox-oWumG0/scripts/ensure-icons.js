// @ts-nocheck
// scripts/ensure-icons.js

const fs = require("fs");
const path = require("path");
const { chromium } = require("@playwright/test");

const ASSETS_DIR = path.resolve(__dirname, "../assets");
const SVG_PATH = path.resolve(ASSETS_DIR, "logo.svg");
const SIZES = [16, 32, 64, 80, 128, 192, 512];

const SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <g fill="#185ABD" stroke="#185ABD">
    <g font-family="Segoe UI, Arial, sans-serif" font-weight="900" stroke="none">
      <text x="135" y="295" font-size="220" text-anchor="middle">Ž</text>
      <text x="345" y="295" font-size="220" text-anchor="middle">Ж</text>
    </g>
    <g stroke-width="26" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M140 368 H372"/>
      <path d="M140 368 L170 338"/>
      <path d="M140 368 L170 398"/>
      <path d="M372 368 L342 338"/>
      <path d="M372 368 L342 398"/>
    </g>
  </g>
</svg>`;

async function generateIcons() {
    // 1. Proveri da li assets folder postoji
    if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR);

    // 2. Osiguraj da logo.svg postoji
    if (!fs.existsSync(SVG_PATH)) {
        fs.writeFileSync(SVG_PATH, SVG_CONTENT);
    }

    // 3. Proveri koje ikonice fale
    const missingSizes = SIZES.filter((s) => !fs.existsSync(path.resolve(ASSETS_DIR, `icon-${s}.png`)));

    if (missingSizes.length === 0) {
        console.log("✅ Sve ikonice su već prisutne.");
        return;
    }

    console.log(`🚀 Generišem ikonice pomoću Playwright-a za veličine: ${missingSizes.join(", ")}...`);

    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Postavi SVG sadržaj u stranicu sa providnom pozadinom
    await page.setContent(`
        <style>
            body { margin: 0; padding: 0; background: transparent; overflow: hidden; }
            svg { display: block; width: 100vw; height: 100vh; }
        </style>
        ${SVG_CONTENT}
    `);

    for (const size of missingSizes) {
        const iconPath = path.resolve(ASSETS_DIR, `icon-${size}.png`);
        await page.setViewportSize({ width: size, height: size });
        await page.screenshot({ path: iconPath, omitBackground: true, scale: "device" });
        console.log(`   ✔ Kreirano: icon-${size}.png`);
    }

    await browser.close();
    console.log("✨ Ikonice uspešno generisane.");
}

if (require.main === module) {
    generateIcons().catch((err) => {
        console.error("❌ Greška pri generisanju ikonica:", err);
        process.exit(1);
    });
}

module.exports = { generateIcons };
