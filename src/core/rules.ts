// src/core/rules.ts

const FOREIGN_CHARS_RE = /[wxyqWXYQ]/;
const FOREIGN_DIGRAPHS_RE = /(?:th|ph|sch|oo|ee|ou|au|ai|ck)/i;
const DOUBLE_CONSONANTS_RE = /(bb|cc|dd|ff|gg|kk|ll|mm|nn|pp|rr|ss|tt|zz)/i;
const SR_DOUBLE_EXCEPTIONS = ["jj", "dd", "nn", "tt"];
const ROMAN_RE =
    /^(?!DIV\b|VID\b|DIM\b|MIX\b|LIL\b)(?=[MDCLXVI])M*(C[MD]|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})$/;
const HASH_LIKE_RE = /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]{3,}$/;

export const ALWAYS_LATIN = [
    // --- UI & CODE TERMS (Top Priority) ---
    "Save",
    "As",
    "Local",
    "Storage",
    "USER",
    "User",
    "Users",
    "File",
    "Edit",
    "View",
    "Insert",
    "Format",
    "Tools",
    "Help",
    "Open",
    "Print",
    "Exit",
    "Undo",
    "Redo",
    "Cut",
    "Copy",
    "Paste",
    "Find",
    "Replace",
    "Select",
    "admin",
    "root",
    "id",
    "ID",
    "null",
    "true",
    "false",
    "Ctrl",
    "Alt",
    "Shift",
    "Esc",
    "Enter",
    "Tab",
    "Backspace",
    "Delete",
    "SELECT",
    "FROM",
    "WHERE",
    "UPDATE",
    "DELETE",
    "INSERT",
    "INTO",
    "VALUES",
    "TABLE",
    "DROP",
    "ALTER",
    "CREATE",
    "JOIN",
    "GROUP",
    "ORDER",
    "BY",
    "LIMIT",
    "function",
    "return",
    "var",
    "let",
    "const",
    "if",
    "else",
    "for",
    "while",
    "switch",
    "case",
    "break",
    "continue",
    "try",
    "catch",
    "finally",
    "throw",
    "new",
    "this",
    "class",
    "interface",
    "extends",
    "implements",
    "public",
    "private",
    "protected",
    "void",
    "int",
    "string",
    "bool",
    "boolean",
    "float",
    "double",
    "char",

    // --- BRENDOVI ---
    "iPhone",
    "iPad",
    "iMac",
    "iOS",
    "macOS",
    "MacBook",
    "Android",
    "YouTube",
    "Facebook",
    "Twitter",
    "LinkedIn",
    "WhatsApp",
    "Viber",
    "TikTok",
    "Instagram",
    "Word",
    "Excel",
    "PowerPoint",
    "Outlook",
    "Office",
    "OneNote",
    "Access",
    "Publisher",
    "Windows",
    "Microsoft",
    "Google",
    "Adobe",
    "Photoshop",
    "Illustrator",
    "Java",
    "JavaScript",
    "TypeScript",
    "Python",
    "React",
    "Angular",
    "Vue",
    "Node.js",
    "C#",
    "C++",
    ".NET",
    "NET",
    "PHP",
    "Ruby",
    "Go",
    "Swift",
    "Kotlin",
    "HTML",
    "CSS",
    "SQL",
    "XML",
    "JSON",
    "API",
    "SDK",
    "USB",
    "HDMI",
    "WiFi",
    "Wi-Fi",
    "Bluetooth",
    "NFC",
    "GPS",
    "LTE",
    "5G",
    "4G",
    "Copyright",
    "Made in Serbia",
    "MB",
    "GB",
    "TB",
    "KB",
    "Mbps",
    "Gbps",
    "GHz",
    "MHz",
    "kHz",
    "Hz",
    "km/h",
    "m/s",
    "kWh",
    "E-mail",
    "e-mail",
    "Email",
    "email",
    "X-Ray",
    "Blu-ray",
    "München",
    "Zürich",
    "Straße",
    "Façade",
    "Déjà vu",
    "über",
];

export const AMBIGUOUS_LATIN = ["Pro", "Air", "Mini", "Ultra", "Plus", "Max", "Lite"];

const normKey = (s: string) => s.normalize("NFC").toLowerCase();
const AMBIGUOUS_LATIN_SET = new Set(AMBIGUOUS_LATIN.map(normKey));

export const ALWAYS_LATIN_TOKENS_AMBIGUOUS = new Set(AMBIGUOUS_LATIN.map(normKey));

export const ALWAYS_LATIN_TOKENS_STRICT = new Set(
    ALWAYS_LATIN.filter((x) => !/\s/.test(x))
        .map(normKey)
        .filter((k) => !AMBIGUOUS_LATIN_SET.has(k))
);

export const ALWAYS_LATIN_TOKENS_BRIDGE = new Set<string>([
    ...Array.from(ALWAYS_LATIN_TOKENS_STRICT),
    ...Array.from(ALWAYS_LATIN_TOKENS_AMBIGUOUS),
]);

export const ALWAYS_LATIN_PHRASES = ALWAYS_LATIN.filter((x) => /\s/.test(x));

export function isForeignWord(word: string): boolean {
    if (FOREIGN_CHARS_RE.test(word)) return true;
    if (FOREIGN_DIGRAPHS_RE.test(word)) return true;
    const doubleMatch = word.match(DOUBLE_CONSONANTS_RE);
    if (doubleMatch) {
        const pair = doubleMatch[0].toLowerCase();
        if (SR_DOUBLE_EXCEPTIONS.includes(pair)) return false;
        return true;
    }
    return false;
}

export function isRomanNumeral(word: string): boolean {
    if (word.toUpperCase() !== word) return false;
    return ROMAN_RE.test(word);
}

export function isHashLike(word: string): boolean {
    return HASH_LIKE_RE.test(word);
}
