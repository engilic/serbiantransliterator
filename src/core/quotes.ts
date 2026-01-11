export function fixSerbianQuotes(segment: string): string {
    let text = segment;

    // sve quote varijante -> "
    text = text.replace(/[â€œâ€â€˜â€™Â«Â»â€žâ€Ÿâ€šâ€›â€¹â€º]/g, `"`);

    // opening
    // FIX: uklonjen nepotreban escape za '[' (no-useless-escape)
    text = text.replace(/(^|[\s([{<\-â€“â€”])"/g, `$1â€ž`);

    // closing (sve preostale)
    text = text.replace(/"/g, "â€");

    return text;
}