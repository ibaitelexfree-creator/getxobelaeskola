/**
 * Generates a cryptographically secure random alphanumeric code.
 * @param length The desired length of the code (default: 6)
 * @returns A secure random string
 */
export function generateSecureCode(length: number = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomArray = new Uint32Array(length);
    if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(randomArray);
    } else if (typeof crypto !== 'undefined') {
        crypto.getRandomValues(randomArray);
    } else {
        // Fallback for extremely old environments, though modern Node/Browsers support crypto
        throw new Error('Crypto API not available');
    }

    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[randomArray[i] % chars.length];
    }
    return result;
}
