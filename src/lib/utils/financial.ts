
/**
 * Utility to parse currency/amount strings into numbers.
 * Handles both dot and comma as decimal separators.
 */
export function parseAmount(val: number | string | undefined | null): number {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    // Remove all characters except numbers, dots, commas and minus sign
    const clean = val.toString().replace(/[^0-9,.-]/g, '').replace(',', '.');
    // If multiple dots remain (unlikely but possible), this might fail, 
    // but usually it's used for standard prices like "200,50" or "200.50".
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
}
