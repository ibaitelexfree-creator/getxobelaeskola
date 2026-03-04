export async function register() {
    // Only attempt this in the Node.js runtime.
    // Cloudflare Edge/Worker runtimes will skip this.
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        try {
            // Using dynamic require or import inside try-catch to satisfy bundlers
            // that might try to resolve node:* modules for Edge runtimes.
            const dns = await import('node:dns');
            if (dns && typeof dns.setDefaultResultOrder === 'function') {
                dns.setDefaultResultOrder('ipv4first');
            }
        } catch (e) {
            // Silently fail if node:dns is unavailable, which shouldn't happen
            // in a standard Node.js environment but ensures build stability.
            console.warn('instrumentation: node:dns unavailable in this environment');
        }
    }
}
