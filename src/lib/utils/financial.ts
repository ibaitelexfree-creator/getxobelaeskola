
/**
 * Utility to parse currency/amount strings into numbers.
 * Handles both dot and comma as decimal separators and supports thousand separators.
 */
export function parseAmount(val: number | string | undefined | null): number {
    if (typeof val === 'number') return val;
    if (!val) return 0;

    let str = val.toString().trim();
    if (!str) return 0;

    // Remove any character that is not a number, dot, comma, or minus sign
    str = str.replace(/[^0-9,.-]/g, '');

    // Handle European format with thousand separators: 1.234,56
    // and US format: 1,234.56
    const lastDot = str.lastIndexOf('.');
    const lastComma = str.lastIndexOf(',');

    if (lastDot !== -1 && lastComma !== -1) {
        if (lastComma > lastDot) {
            // European format: 1.234,56 -> remove dots, then comma to dot
            str = str.replace(/\./g, '').replace(',', '.');
        } else {
            // US format: 1,234.56 -> remove commas
            str = str.replace(/,/g, '');
        }
    } else if (lastComma !== -1) {
        // Only commas present: 1,234,567 or 1234,56
        const commas = str.match(/,/g) || [];
        if (commas.length > 1) {
            // Multiple commas: treat as thousand separators
            str = str.replace(/,/g, '');
        } else {
            // Single comma: treat as decimal separator
            str = str.replace(',', '.');
        }
    } else if (lastDot !== -1) {
        // Only dots present: 1.234.567 or 1234.56
        const dots = str.match(/\./g) || [];
        if (dots.length > 1) {
            // Multiple dots: treat as thousand separators
            str = str.replace(/\./g, '');
        }
        // Single dot: standard JS parseFloat handles it correctly
    }

    const parsed = parseFloat(str);
    return isNaN(parsed) ? 0 : parsed;
}
