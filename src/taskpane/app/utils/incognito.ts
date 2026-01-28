// src/taskpane/app/utils/incognito.ts
import { showPreviewToast } from "../modal/previewModal";

export function checkIncognito() {
    try {
        localStorage.setItem("test", "test");
        localStorage.removeItem("test");
    } catch (e) {
        // Storage quota exceeded or disabled (Incognito / Private Mode)
        showPreviewToast("⚠️ Incognito/Private Mode: Podešavanja se neće čuvati.", "info", 5000);
    }
}
