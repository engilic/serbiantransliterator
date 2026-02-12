// src/shared/utils/binary.ts

export function dataUriToBytes(dataUri: string | null | undefined): Uint8Array {
    const str = String(dataUri || "");
    const base64 = str.includes(",") ? str.split(",")[1] : str;
    if (!base64 || base64.length < 2) return new Uint8Array(0);
    try {
        const binaryStr = window.atob(base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
        return bytes;
    } catch {
        return new Uint8Array(0);
    }
}
