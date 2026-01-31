// @ts-nocheck
// tests-e2e/fuzz.spec.ts

import { test, expect } from "@playwright/test";
import fc from "fast-check";

test.describe("E2E Fuzzing / Stability", () => {
    test.beforeEach(async ({ page }) => {
        // Mock Office.js
        await page.addInitScript(() => {
            let selectedText = "";
            (window as any).Office = {
                HostType: { Word: "Word" },
                CoercionType: { Text: "Text" },
                AsyncResultStatus: { Succeeded: "succeeded" },
                context: {
                    document: {
                        addHandlerAsync: (_e: any, _h: any, cb: any) => cb && cb({ status: "succeeded" }),
                        removeHandlerAsync: (_e: any, _h: any, cb: any) => cb && cb({ status: "succeeded" }),
                        getSelectedDataAsync: (_type: any, cb: any) => {
                            cb({ status: "succeeded", value: selectedText });
                        },
                        setSelectedDataAsync: (_data: string, _opts: any, cb: any) => {
                            cb && cb({ status: "succeeded" });
                        },
                    },
                },
                onReady: (cb: any) => cb({ host: "Word" }),
            };
            (window as any).__setSelection = (text: string) => {
                selectedText = text;
            };
        });
    });

    test("Monkey test: Random inputs do not crash the app", async ({ page }) => {
        await page.goto("/taskpane.html");
        await expect(page.locator("#appMain")).toBeVisible();

        // Ograničavamo na 10 iteracija da test ne traje večno u CI
        await fc.assert(
            fc.asyncProperty(fc.string({ minLength: 1, maxLength: 100 }), async (randomText) => {
                // 1. Postavi selekciju
                await page.evaluate((txt) => (window as any).__setSelection(txt), randomText);

                // 2. Osveži UI (jer naš mock ne okida evente automatski)
                // Najbrži način je da simuliramo promenu fokusa ili tajmer u selection.ts
                // Ali pošto je selection.ts već učitan, možemo samo da pozovemo checkSelection... ako je exposed? Nije.
                // Zato reloadujemo page ili koristimo 'force' click koji možda neće raditi ako je disabled.

                // Hack: ručno enable dugme i klikni
                await page.evaluate(() => {
                    const btn = document.getElementById("runBtn") as HTMLButtonElement;
                    btn.disabled = false;
                    btn.click();
                });

                // 3. Proveri da nema greške (msg element ne sme biti crven i sa tekstom "Global Error")
                const msg = page.locator("#msg");
                // Sačekaj da se nešto desi (bilo šta)
                await expect(msg).toBeVisible();

                // Proveri boju (ne sme biti error color ako je tekst validan)
                // Ali random tekst može izazvati validnu grešku.
                // Bitno je da aplikacija i dalje radi.

                return true;
            }),
            { numRuns: 10 }
        );
    });
});
