/**
 * Generates a cryptographically secure random alphanumeric string of a given length.
 *
 * @param length The length of the string to generate (default 6)
 * @returns A secure random alphanumeric string
 */
export function generateSecureRoomCode(length: number = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
    }

    return result;
}
