/* global Office, Word */
import { convertOoxml } from "../shared/transliterator";

type DirectionUi = "auto" | "lat-to-cyr" | "cyr-to-lat";
type ProfilePreset = "custom" | "it" | "legal" | "journalism";

type ConvertStatsLike = any; // fallback ako type export nije uključen

interface UiSettings {
  schemaVersion: 1;
  profile: ProfilePreset;
  userWords: string;
  protectBrands: boolean;
  applySerbianQuotes: boolean;
  preserveCodeBlocks: boolean;
  confirmWholeDoc: boolean;
  showStats: boolean;
  direction: DirectionUi;
}

const SETTINGS_KEY = "serbiantransliterator.settings.v2";

const PRESETS: Record<Exclude<ProfilePreset, "custom">, Omit<UiSettings, "profile" | "schemaVersion">> = {
  it: {
    direction: "auto",
    protectBrands: true,
    applySerbianQuotes: false,
    preserveCodeBlocks: true,
    confirmWholeDoc: true,
    showStats: false,
    userWords: [
      "Git",
      "GitHub",
      "GitLab",
      "Azure",
      "AWS",
      "GCP",
      "DevOps",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "YAML",
      "REST",
      "GraphQL",
      "PowerShell",
      "VS Code",
      "Visual Studio",
      "Windows Server",
      "Linux",
      "SerbianTransliterator"
    ].join("\n"),
  },
  legal: {
    direction: "auto",
    protectBrands: true,
    applySerbianQuotes: true,
    preserveCodeBlocks: true,
    confirmWholeDoc: true,
    showStats: false,
    userWords: [
      "Ustav Republike Srbije",
      "Zakon o obligacionim odnosima",
      "Zakon o radu",
      "Ministarstvo pravde",
      "Privredni sud",
      "Advokatska komora Srbije"
    ].join("\n"),
  },
  journalism: {
    direction: "auto",
    protectBrands: true,
    applySerbianQuotes: true,
    preserveCodeBlocks: true,
    confirmWholeDoc: true,
    showStats: false,
    userWords: [
      "Reuters",
      "Associated Press",
      "BBC",
      "CNN",
      "Euronews",
      "N1",
      "RTS",
      "Tanjug",
      "NBA",
      "UEFA",
      "FIFA"
    ].join("\n"),
  },
};

type ModalMode = "confirm" | "text";
let modalOpen = false;

// čuvamo poslednju statistiku u memoriji (da može show/hide posle run-a)
let lastStatsText = "(Nema statistike još)";
let lastStatsTitle = "Statistika poslednje akcije";

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    initUi();
  }
});

function initUi() {
  const runBtn = document.getElementById("runBtn") as HTMLButtonElement | null;
  const previewBtn = document.getElementById("previewBtn") as HTMLButtonElement | null;
  const exportBtn = document.getElementById("exportBtn") as HTMLButtonElement | null;
  const importBtn = document.getElementById("importBtn") as HTMLButtonElement | null;
  const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement | null;

  if (runBtn) runBtn.onclick = () => runWithUiLock(runSmart);
  if (previewBtn) previewBtn.onclick = () => runWithUiLock(runPreview);
  if (exportBtn) exportBtn.onclick = () => runWithUiLock(exportSettings);
  if (importBtn) importBtn.onclick = () => runWithUiLock(importSettings);
  if (resetBtn) resetBtn.onclick = () => resetSettings();

  const settings = loadSettings();
  if (settings) {
    applySettingsToUi(settings);
  } else {
    setPresetSelectValue("custom");
    setTextareaValue("userWords", "");
    setCheckboxValue("optProtectBrands", true);
    setCheckboxValue("optSerbianQuotes", true);
    setCheckboxValue("optPreserveCodeBlocks", true);
    setCheckboxValue("optConfirmWholeDoc", true);
    setCheckboxValue("optShowStats", false);
    setDirectionUi("auto");
    saveSettings();
  }

  const presetEl = document.getElementById("profilePreset") as HTMLSelectElement | null;
  if (presetEl) {
    presetEl.addEventListener("change", () => {
      const profile = (presetEl.value as ProfilePreset) ?? "custom";
      if (profile !== "custom") {
        applyPresetSmart(profile);
      } else {
        setPresetSelectValue("custom");
        setStatus("Profil: custom");
      }
      saveSettings();
    });
  }

  // Auto-save
  (document.getElementById("userWords") as HTMLTextAreaElement | null)?.addEventListener("input", saveSettings);
  (document.getElementById("optProtectBrands") as HTMLInputElement | null)?.addEventListener("change", saveSettings);
  (document.getElementById("optSerbianQuotes") as HTMLInputElement | null)?.addEventListener("change", saveSettings);
  (document.getElementById("optPreserveCodeBlocks") as HTMLInputElement | null)?.addEventListener("change", saveSettings);
  (document.getElementById("optConfirmWholeDoc") as HTMLInputElement | null)?.addEventListener("change", saveSettings);

  const showStatsEl = document.getElementById("optShowStats") as HTMLInputElement | null;
  if (showStatsEl) {
    showStatsEl.addEventListener("change", () => {
      saveSettings();
      refreshStatsVisibilityAndContent();
    });
    // init visibility
    refreshStatsVisibilityAndContent();
  }

  (document.getElementById("dirAuto") as HTMLInputElement | null)?.addEventListener("change", saveSettings);
  (document.getElementById("dirLatToCyr") as HTMLInputElement | null)?.addEventListener("change", saveSettings);
  (document.getElementById("dirCyrToLat") as HTMLInputElement | null)?.addEventListener("change", saveSettings);
}

function refreshStatsVisibilityAndContent() {
  const show = getCheckboxValue("optShowStats", false);

  const box = document.getElementById("statsBox") as HTMLDivElement | null;
  const title = document.getElementById("statsTitle") as HTMLDivElement | null;
  const text = document.getElementById("statsText") as HTMLPreElement | null;

  if (!box || !title || !text) return;

  box.style.display = show ? "block" : "none";
  title.textContent = lastStatsTitle;
  text.textContent = lastStatsText;
}

async function runWithUiLock(fn: () => Promise<void>) {
  const runBtn = document.getElementById("runBtn") as HTMLButtonElement | null;
  const previewBtn = document.getElementById("previewBtn") as HTMLButtonElement | null;

  try {
    if (runBtn) runBtn.disabled = true;
    if (previewBtn) previewBtn.disabled = true;
    await fn();
  } finally {
    if (runBtn) runBtn.disabled = false;
    if (previewBtn) previewBtn.disabled = false;
  }
}

/* ─────────────────────────────
   Presets (smart merge)
   ───────────────────────────── */

function applyPresetSmart(profile: Exclude<ProfilePreset, "custom">) {
  const preset = PRESETS[profile];

  const current = getTextareaValue("userWords");
  const { mergedText, addedCount } = mergeWordLists(current, preset.userWords);

  setPresetSelectValue(profile);
  setTextareaValue("userWords", mergedText);

  setCheckboxValue("optProtectBrands", preset.protectBrands);
  setCheckboxValue("optSerbianQuotes", preset.applySerbianQuotes);
  setCheckboxValue("optPreserveCodeBlocks", preset.preserveCodeBlocks);
  setCheckboxValue("optConfirmWholeDoc", preset.confirmWholeDoc);
  setCheckboxValue("optShowStats", preset.showStats);
  setDirectionUi(preset.direction);

  lastStatsTitle = "Statistika poslednje akcije";
  lastStatsText = `Profil: ${profile}\nDodato novih stavki: ${addedCount}`;
  refreshStatsVisibilityAndContent();

  setStatus(`Profil: ${profile}. Dodato novih stavki: ${addedCount}.`);
}

function mergeWordLists(existingText: string, incomingText: string): { mergedText: string; addedCount: number } {
  const normLine = (s: string) => s.normalize("NFC").trim().replace(/\s+/g, " ");

  const existingLinesRaw = existingText.split(/\r?\n/);
  const incomingLinesRaw = incomingText.split(/\r?\n/);

  const existingLines: string[] = [];
  const set = new Set<string>();

  for (const line of existingLinesRaw) {
    const key = normLine(line);
    if (!key) continue;
    if (set.has(key)) continue;
    set.add(key);
    existingLines.push(key);
  }

  let added = 0;
  const additions: string[] = [];

  for (const line of incomingLinesRaw) {
    const key = normLine(line);
    if (!key) continue;
    if (set.has(key)) continue;
    set.add(key);
    additions.push(key);
    added++;
  }

  return { mergedText: existingLines.concat(additions).join("\n"), addedCount: added };
}

/* ─────────────────────────────
   Modal helpers (NO window.confirm / NO window.prompt)
   ───────────────────────────── */

function showModal(opts: {
  title: string;
  message: string;
  mode: ModalMode;
  okText?: string;
  cancelText?: string;
  value?: string;
  readOnly?: boolean;
}): Promise<{ ok: boolean; value?: string }> {
  if (modalOpen) return Promise.resolve({ ok: false });
  modalOpen = true;

  const overlay = document.getElementById("modalOverlay") as HTMLDivElement | null;
  const titleEl = document.getElementById("modalTitle") as HTMLDivElement | null;
  const textEl = document.getElementById("modalText") as HTMLDivElement | null;
  const inputEl = document.getElementById("modalInput") as HTMLTextAreaElement | null;
  const okBtn = document.getElementById("modalOk") as HTMLButtonElement | null;
  const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement | null;

  if (!overlay || !titleEl || !textEl || !inputEl || !okBtn || !cancelBtn) {
    modalOpen = false;
    return Promise.resolve({ ok: false });
  }

  titleEl.textContent = opts.title;
  textEl.textContent = opts.message;

  okBtn.textContent = opts.okText ?? "OK";
  cancelBtn.textContent = opts.cancelText ?? "Cancel";

  if (opts.mode === "text") {
    inputEl.style.display = "block";
    inputEl.value = opts.value ?? "";
    inputEl.readOnly = !!opts.readOnly;
  } else {
    inputEl.style.display = "none";
    inputEl.value = "";
    inputEl.readOnly = false;
  }

  overlay.style.display = "flex";

  return new Promise((resolve) => {
    const cleanup = (result: { ok: boolean; value?: string }) => {
      overlay.style.display = "none";
      okBtn.onclick = null;
      cancelBtn.onclick = null;
      modalOpen = false;
      resolve(result);
    };

    okBtn.onclick = () => {
      if (opts.mode === "text") cleanup({ ok: true, value: inputEl.value });
      else cleanup({ ok: true });
    };

    cancelBtn.onclick = () => cleanup({ ok: false });
  });
}

async function confirmInPanel(message: string): Promise<boolean> {
  const res = await showModal({
    title: "Potvrda",
    message,
    mode: "confirm",
    okText: "Da",
    cancelText: "Ne",
  });
  return res.ok;
}

async function showTextDialog(title: string, message: string, value: string, readOnly: boolean): Promise<string | null> {
  const res = await showModal({
    title,
    message,
    mode: "text",
    okText: readOnly ? "Zatvori" : "OK",
    cancelText: readOnly ? "Zatvori" : "Cancel",
    value,
    readOnly,
  });

  if (!res.ok && !readOnly) return null;
  return res.value ?? "";
}

/* ─────────────────────────────
   Word actions
   ───────────────────────────── */

async function runSmart() {
  setStatus("Radim preslovljavanje...");

  try {
    await Word.run(async (context) => {
      let range = context.document.getSelection();
      range.load("text");
      await context.sync();

      const selectionText = range.text ?? "";
      const hasSelection = selectionText.trim().length > 0;

      const confirmWholeDoc = getCheckboxValue("optConfirmWholeDoc", true);
      if (!hasSelection) {
        if (confirmWholeDoc) {
          const ok = await confirmInPanel("Nema selekcije. Da li želiš da presloviš CEO dokument?");
          if (!ok) {
            setStatus("Otkazano (nema selekcije).");
            return;
          }
        }
        range = context.document.body.getRange("Whole");
      }

      const ooxml = range.getOoxml();
      await context.sync();

      const opts = readOptionsFromUi();
      saveSettings();

      const result = convertOoxml(ooxml.value, opts as any) as any as { xml: string; type: string; stats?: ConvertStatsLike };

      if (result.type === "Nema teksta") {
        setStatus("Nema teksta za konverziju.");
        lastStatsTitle = "Statistika poslednje akcije";
        lastStatsText = "Nema teksta.";
        refreshStatsVisibilityAndContent();
        return;
      }

      range.insertOoxml(result.xml, Word.InsertLocation.replace);
      await context.sync();

      setStatus(`Uspeh: ${result.type}\n(Napomena: Undo sa Ctrl+Z)`);

      const scope = hasSelection ? "Selekcija" : "Ceo dokument";
      lastStatsTitle = `Statistika: ${result.type}`;
      lastStatsText = formatStatsFriendly(result.stats, scope);
      refreshStatsVisibilityAndContent();
    });
  } catch (error) {
    console.error(error);
    setStatus("Greška: " + error);
  }
}

async function runPreview() {
  setStatus("Pravim preview...");

  try {
    await Word.run(async (context) => {
      let range = context.document.getSelection();
      range.load("text");
      await context.sync();

      const selectionText = range.text ?? "";
      const hasSelection = selectionText.trim().length > 0;

      const confirmWholeDoc = getCheckboxValue("optConfirmWholeDoc", true);
      if (!hasSelection) {
        if (confirmWholeDoc) {
          const ok = await confirmInPanel("Nema selekcije. Preview za CEO dokument?");
          if (!ok) {
            setStatus("Otkazano preview (nema selekcije).");
            return;
          }
        }
        range = context.document.body.getRange("Whole");
      }

      const ooxml = range.getOoxml();
      await context.sync();

      const opts = readOptionsFromUi();
      const result = convertOoxml(ooxml.value, opts as any) as any as { xml: string; type: string; stats?: ConvertStatsLike };

      const previewText = extractTextFromOoxml(result.xml);
      const snippet = previewText.length > 700 ? previewText.slice(0, 700) + "…" : previewText;

      setStatus(`Preview: ${result.type}\n\n${snippet}`);

      const scope = hasSelection ? "Selekcija" : "Ceo dokument";
      lastStatsTitle = `Statistika (preview): ${result.type}`;
      lastStatsText = formatStatsFriendly(result.stats, scope);
      refreshStatsVisibilityAndContent();
    });
  } catch (error) {
    console.error(error);
    setStatus("Greška (preview): " + error);
  }
}

function extractTextFromOoxml(ooxml: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(ooxml, "application/xml");
    let nodes = doc.getElementsByTagName("w:t");
    if (nodes.length === 0) nodes = doc.getElementsByTagName("t");

    let out = "";
    for (let i = 0; i < nodes.length; i++) out += nodes[i].textContent ?? "";
    return out;
  } catch {
    return "";
  }
}

/* ─────────────────────────────
   Stats formatting (user-friendly)
   ───────────────────────────── */

function formatStatsFriendly(stats: ConvertStatsLike | undefined, scope: string): string {
  if (!stats) return `Opseg: ${scope}\nStatistika nije dostupna (convertOoxml ne vraća stats).`;

  const urls = stats.detected?.urls ?? 0;
  const emails = stats.detected?.emails ?? 0;

  const fenceSeen = stats.code?.fenceMarkersSeen ?? 0;
  const tickSeen = stats.code?.inlineTicksSeen ?? 0;

  const endedInFence = !!stats.code?.endedInFence;
  const endedInInline = !!stats.code?.endedInInline;

  const warn =
    endedInFence || endedInInline
      ? "Upozorenje: deluje da imaš otvoren ` ili ``` bez zatvaranja.\nProveri da li je svaki ` i ``` zatvoren (inače zaštita koda može obuhvatiti veći deo teksta)."
      : "";

  const bridges = stats.bridges ?? {};
  const bridgesTotal =
    (bridges.links ?? 0) +
    (bridges.brandPhrases ?? 0) +
    (bridges.brandTokens ?? 0) +
    (bridges.digraphs ?? 0) +
    (bridges.userPhrases ?? 0) +
    (bridges.userTokens ?? 0) +
    (bridges.allCapsHints ?? 0);

  const protectedHint =
    urls || emails || fenceSeen || tickSeen
      ? `Zaštićeno: URL ${urls}, email ${emails}, code markers ( \`\`\` ${fenceSeen}, \` ${tickSeen} )`
      : "Zaštićeno: (nema)";

  const bridgesHint =
    bridgesTotal > 0
      ? `Pametno spajanje preko stilova/run‑ova: ${bridgesTotal} (link ${bridges.links ?? 0}, brend ${bridges.brandTokens ?? 0}, fraze ${bridges.brandPhrases ?? 0}, digraf ${bridges.digraphs ?? 0}, user ${(bridges.userPhrases ?? 0) + (bridges.userTokens ?? 0)})`
      : "Pametno spajanje preko stilova/run‑ova: 0";

  const time = typeof stats.timingMs === "number" ? `${stats.timingMs.toFixed(1)} ms` : "n/a";
  const charsBefore = stats.charsBefore ?? 0;
  const charsAfter = stats.charsAfter ?? 0;

  return [
    `Opseg: ${scope}`,
    `Obim: ${charsBefore} → ${charsAfter} karaktera`,
    protectedHint,
    bridgesHint,
    `Vreme: ${time}`,
    warn,
  ].filter(Boolean).join("\n");
}

/* ─────────────────────────────
   Import/Export settings (NO prompt)
   ───────────────────────────── */

async function exportSettings() {
  const settings = readSettingsFromUi();
  const json = JSON.stringify(settings, null, 2);

  let copied = false;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(json);
      copied = true;
    } catch {
      copied = false;
    }
  }

  const msg = copied
    ? "Podešavanja su kopirana u clipboard.\n\n(Backup prikaz ispod.)"
    : "Clipboard nije dostupan u ovom hostu.\nKopiraj ručno iz polja ispod.";

  await showTextDialog("Export settings", msg, json, true);
  setStatus(copied ? "Export: kopirano u clipboard." : "Export: prikaženo (kopiraj ručno).");
}

async function importSettings() {
  const pasted = await showTextDialog(
    "Import settings",
    "Nalepi JSON podešavanja u polje ispod i klikni OK.",
    "",
    false
  );

  if (pasted == null) {
    setStatus("Import otkazan.");
    return;
  }

  try {
    const parsed = JSON.parse(pasted) as Partial<UiSettings>;

    const normalized: UiSettings = {
      schemaVersion: 1,
      profile:
        parsed.profile === "it" || parsed.profile === "legal" || parsed.profile === "journalism"
          ? parsed.profile
          : "custom",
      userWords: typeof parsed.userWords === "string" ? parsed.userWords : "",
      protectBrands: typeof parsed.protectBrands === "boolean" ? parsed.protectBrands : true,
      applySerbianQuotes: typeof parsed.applySerbianQuotes === "boolean" ? parsed.applySerbianQuotes : true,
      preserveCodeBlocks: typeof parsed.preserveCodeBlocks === "boolean" ? parsed.preserveCodeBlocks : true,
      confirmWholeDoc: typeof parsed.confirmWholeDoc === "boolean" ? parsed.confirmWholeDoc : true,
      showStats: typeof parsed.showStats === "boolean" ? parsed.showStats : false,
      direction:
        parsed.direction === "lat-to-cyr" || parsed.direction === "cyr-to-lat" ? parsed.direction : "auto",
    };

    applySettingsToUi(normalized);
    saveSettings();
    setStatus("Import uspešan.");
    refreshStatsVisibilityAndContent();
  } catch {
    setStatus("Import neuspešan: nevažeći JSON.");
  }
}

function resetSettings() {
  try { localStorage.removeItem(SETTINGS_KEY); } catch {}

  setPresetSelectValue("custom");
  setTextareaValue("userWords", "");
  setCheckboxValue("optProtectBrands", true);
  setCheckboxValue("optSerbianQuotes", true);
  setCheckboxValue("optPreserveCodeBlocks", true);
  setCheckboxValue("optConfirmWholeDoc", true);
  setCheckboxValue("optShowStats", false);
  setDirectionUi("auto");
  saveSettings();

  lastStatsTitle = "Statistika poslednje akcije";
  lastStatsText = "(Nema statistike još)";
  refreshStatsVisibilityAndContent();

  setStatus("Podešavanja resetovana.");
}

/* ─────────────────────────────
   UI read/write
   ───────────────────────────── */

function readOptionsFromUi() {
  return {
    userProtected: getUserProtectedWords(),
    protectBrands: getCheckboxValue("optProtectBrands", true),
    applySerbianQuotes: getCheckboxValue("optSerbianQuotes", true),
    preserveCodeBlocks: getCheckboxValue("optPreserveCodeBlocks", true),
    direction: getDirectionFromUi(),
  };
}

function setStatus(text: string) {
  const el = document.getElementById("msg");
  if (el) el.textContent = text;
}

function getUserProtectedWords(): string[] {
  const el = document.getElementById("userWords") as HTMLTextAreaElement | null;
  if (!el) return [];
  return el.value.split(/\r?\n/).map((w) => w.trim()).filter((w) => w.length > 0);
}

function getTextareaValue(id: string): string {
  const el = document.getElementById(id) as HTMLTextAreaElement | null;
  return el?.value ?? "";
}

function getCheckboxValue(id: string, defaultValue: boolean): boolean {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (!el) return defaultValue;
  return !!el.checked;
}

function setCheckboxValue(id: string, value: boolean) {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (el) el.checked = value;
}

function setTextareaValue(id: string, value: string) {
  const el = document.getElementById(id) as HTMLTextAreaElement | null;
  if (el) el.value = value;
}

function setPresetSelectValue(value: ProfilePreset) {
  const el = document.getElementById("profilePreset") as HTMLSelectElement | null;
  if (el) el.value = value;
}

function setDirectionUi(dir: DirectionUi) {
  const dirAuto = document.getElementById("dirAuto") as HTMLInputElement | null;
  const dirLatToCyr = document.getElementById("dirLatToCyr") as HTMLInputElement | null;
  const dirCyrToLat = document.getElementById("dirCyrToLat") as HTMLInputElement | null;

  if (dir === "lat-to-cyr") dirLatToCyr && (dirLatToCyr.checked = true);
  else if (dir === "cyr-to-lat") dirCyrToLat && (dirCyrToLat.checked = true);
  else dirAuto && (dirAuto.checked = true);
}

function getDirectionFromUi(): DirectionUi {
  const latToCyr = document.getElementById("dirLatToCyr") as HTMLInputElement | null;
  const cyrToLat = document.getElementById("dirCyrToLat") as HTMLInputElement | null;

  if (latToCyr?.checked) return "lat-to-cyr";
  if (cyrToLat?.checked) return "cyr-to-lat";
  return "auto";
}

/* ─────────────────────────────
   Settings persistence
   ───────────────────────────── */

function loadSettings(): UiSettings | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<UiSettings>;

    const profile: ProfilePreset =
      parsed.profile === "it" || parsed.profile === "legal" || parsed.profile === "journalism"
        ? parsed.profile
        : "custom";

    const direction: DirectionUi =
      parsed.direction === "lat-to-cyr" || parsed.direction === "cyr-to-lat" ? parsed.direction : "auto";

    return {
      schemaVersion: 1,
      profile,
      userWords: typeof parsed.userWords === "string" ? parsed.userWords : "",
      protectBrands: typeof parsed.protectBrands === "boolean" ? parsed.protectBrands : true,
      applySerbianQuotes: typeof parsed.applySerbianQuotes === "boolean" ? parsed.applySerbianQuotes : true,
      preserveCodeBlocks: typeof parsed.preserveCodeBlocks === "boolean" ? parsed.preserveCodeBlocks : true,
      confirmWholeDoc: typeof parsed.confirmWholeDoc === "boolean" ? parsed.confirmWholeDoc : true,
      showStats: typeof parsed.showStats === "boolean" ? parsed.showStats : false,
      direction,
    };
  } catch {
    return null;
  }
}

function applySettingsToUi(settings: UiSettings) {
  setPresetSelectValue(settings.profile);
  setTextareaValue("userWords", settings.userWords);
  setCheckboxValue("optProtectBrands", settings.protectBrands);
  setCheckboxValue("optSerbianQuotes", settings.applySerbianQuotes);
  setCheckboxValue("optPreserveCodeBlocks", settings.preserveCodeBlocks);
  setCheckboxValue("optConfirmWholeDoc", settings.confirmWholeDoc);
  setCheckboxValue("optShowStats", settings.showStats);
  setDirectionUi(settings.direction);

  refreshStatsVisibilityAndContent();
}

function readSettingsFromUi(): UiSettings {
  const presetEl = document.getElementById("profilePreset") as HTMLSelectElement | null;
  const profile = ((presetEl?.value as ProfilePreset) ?? "custom");

  const userWordsEl = document.getElementById("userWords") as HTMLTextAreaElement | null;
  const protectBrandsEl = document.getElementById("optProtectBrands") as HTMLInputElement | null;
  const serbianQuotesEl = document.getElementById("optSerbianQuotes") as HTMLInputElement | null;
  const preserveCodeEl = document.getElementById("optPreserveCodeBlocks") as HTMLInputElement | null;
  const confirmWholeEl = document.getElementById("optConfirmWholeDoc") as HTMLInputElement | null;
  const showStatsEl = document.getElementById("optShowStats") as HTMLInputElement | null;

  return {
    schemaVersion: 1,
    profile,
    userWords: userWordsEl?.value ?? "",
    protectBrands: protectBrandsEl?.checked ?? true,
    applySerbianQuotes: serbianQuotesEl?.checked ?? true,
    preserveCodeBlocks: preserveCodeEl?.checked ?? true,
    confirmWholeDoc: confirmWholeEl?.checked ?? true,
    showStats: showStatsEl?.checked ?? false,
    direction: getDirectionFromUi(),
  };
}

function saveSettings() {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(readSettingsFromUi()));
  } catch {
    // ignore
  }
}