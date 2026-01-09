export const ALWAYS_LATIN = [
    // --- BRENDOVI I TEHNOLOGIJE ---
    "iPhone", "iPad", "iMac", "iOS", "macOS", "MacBook", "Android",
    "YouTube", "Facebook", "Twitter", "LinkedIn", "WhatsApp", "Viber", "TikTok", "Instagram",
    "Word", "Excel", "PowerPoint", "Outlook", "Office", "OneNote", "Access", "Publisher", "Windows", "Microsoft", "Google",
    "Adobe", "Photoshop", "Illustrator", "InDesign", "Premiere",
    "Java", "JavaScript", "TypeScript", "Python", "React", "Angular", "Vue", "Node.js", "C#", "C++", ".NET", "PHP", "Ruby", "Go", "Swift", "Kotlin",
    "HTML", "CSS", "SQL", "XML", "JSON", "API", "SDK", "USB", "HDMI", "WiFi", "Wi-Fi", "Bluetooth", "NFC", "GPS", "LTE", "5G", "4G",
    "VBA", "VSTO", "COM", "Add-in", "Plugin", "Extension",
    "Guid", "GUID", "Uuid", "UUID", "Hash", "Base64",

    // --- UI TERMINI I KOMANDE ---
    "File", "Edit", "View", "Insert", "Format", "Tools", "Table", "Window", "Help",
    "Save", "Save As", "Open", "Close", "Print", "Export", "Import", "Exit",
    "Undo", "Redo", "Cut", "Copy", "Paste", "Find", "Replace", "Select All",
    "Ctrl", "Alt", "Shift", "Esc", "Enter", "Tab", "Backspace", "Delete", "Home", "End", "PgUp", "PgDn", "Ins", "Del",
    "Button", "Checkbox", "Radio", "Input", "Label", "Form", "Frame", "Panel", "Menu", "Ribbon", "Toolbar", "StatusBar",
    "Browser", "Cache", "Cookie", "Session", "Local Storage", "Server", "Client", "Database", "Host", "Port", "Domain",
    "Error", "Warning", "Info", "Debug", "Console", "Terminal", "Shell", "Command", "Prompt",
    "Login", "Logout", "Sign In", "Sign Out", "Register", "Password", "Username",
    "Users", "User", "admin", "root", "id", "ID", "null", "true", "false",
    "Cert", "CurrentUser", "TrustedPublisher", "ChildItem",

    // --- JEDINICE I KRATICE ---
    "Copyright", "Made in Serbia",
    "MB", "GB", "TB", "PB", "KB", "Mbps", "Gbps",
    "GHz", "MHz", "kHz", "Hz",
    "km/h", "m/s", "kWh",
    "E-mail", "e-mail", "Email", "email",
    "X-Ray", "X Ray", "Blue-Ray", "Blu-ray",
    "Pro", "Air", "Mini", "Ultra", "Plus", "Max", "Lite",
    "°C", "°F",

    // --- STRANE FRAZE I IMENA ---
    "München", "Zürich", "Straße", "Façade", "Déjà vu", "über",

    // --- SQL KLJUČNE REČI (Izbačeni "ON" i "AS" jer prave probleme u srpskom) ---
    "SELECT", "FROM", "WHERE", "UPDATE", "DELETE", "INSERT", "INTO", "VALUES",
    "TABLE", "DROP", "ALTER", "CREATE", "JOIN", "GROUP", "ORDER", "BY", "LIMIT", "DESC",
    "function", "return", "var", "let", "const", "if", "else", "for", "while", "switch", "case", "break", "continue",
    "try", "catch", "finally", "throw", "new", "this", "class", "interface", "extends", "implements", "public", "private", "protected",
    "void", "int", "string", "bool", "boolean", "float", "double", "char",
];

const normKey = (s: string) => s.normalize("NFC").toLowerCase();

// Tokeni bez razmaka (npr. iPhone, C++, Node.js, Pro...)
export const ALWAYS_LATIN_TOKENS = new Set(
    ALWAYS_LATIN.filter((x) => !/\s/.test(x)).map(normKey)
);

// Fraze sa razmakom (npr. "Save As", "Made in Serbia")
export const ALWAYS_LATIN_PHRASES = ALWAYS_LATIN.filter((x) => /\s/.test(x));