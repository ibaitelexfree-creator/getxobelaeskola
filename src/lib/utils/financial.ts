
/**
 * Utility to parse currency/amount strings into numbers.
 * Handles both dot and comma as decimal separators.
 */
export function parseAmount(val: number | string | undefined | null): number {
    if (typeof val === 'number') return val;
    if (!val) return 0;

    // Remove all characters except numbers, dots, commas and minus sign
    let s = val.toString().replace(/[^0-9,.-]/g, '');

    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    const commas = (s.match(/,/g) || []).length;
    const dots = (s.match(/\./g) || []).length;

    if (commas > 1) {
        // Multiple commas -> they are thousand separators. Dot (if any) is decimal.
        s = s.replace(/,/g, '');
    } else if (dots > 1) {
        // Multiple dots -> they are thousand separators. Comma (if any) is decimal.
        s = s.replace(/\./g, '').replace(',', '.');
    } else if (commas === 1 && dots === 1) {
        // Both exist once. The one that appears last is the decimal separator.
        if (lastComma > lastDot) {
            // European format: "1.234,56"
            s = s.replace(/\./g, '').replace(',', '.');
        } else {
            // US format: "1,234.56"
            s = s.replace(/,/g, '');
        }
    } else {
        // Only one separator or none.
        // Standard behavior: treat comma as dot.
        s = s.replace(',', '.');
    }

    const parsed = parseFloat(s);
    return isNaN(parsed) ? 0 : parsed;
}
