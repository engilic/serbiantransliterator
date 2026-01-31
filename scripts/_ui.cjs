// scripts/_ui.cjs

"use strict";

// Bright paleta (čitljivije u pwsh na crnoj pozadini)
const C = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",

    red: "\x1b[31m",
    green: "\x1b[32m",

    // bright varijante
    yellow: "\x1b[93m",
    blue: "\x1b[94m",
    cyan: "\x1b[96m",

    magenta: "\x1b[95m",
    gray: "\x1b[90m",

    bgRed: "\x1b[41m",
    white: "\x1b[97m",
};

const COLOR_ENABLED = !!process.stdout.isTTY && !process.env.NO_COLOR;

function color(code, text) {
    return COLOR_ENABLED ? `${code}${text}${C.reset}` : text;
}

// Standardizovane “etikete”
function ok(text) {
    return color(C.green, `✔ ${text}`);
}
function warn(text) {
    return color(C.yellow, `⚠ ${text}`);
}
function fail(text) {
    return color(C.red, `✖ ${text}`);
}

// Za “Scanning…” linije (da ne bude tamno)
function scan(text) {
    console.log(color(C.cyan, text));
}

module.exports = {
    C,
    COLOR_ENABLED,
    color,
    ok,
    warn,
    fail,
    scan,
};
