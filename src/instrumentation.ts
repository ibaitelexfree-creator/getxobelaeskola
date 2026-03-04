export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      // Use require for Node.js-only module to avoid Edge runtime bundling issues during build
      // @ts-ignore - require is available in nodejs runtime
      const dns = require('node:dns');
      if (dns.setDefaultResultOrder) {
        dns.setDefaultResultOrder('ipv4first');
      }
    } catch (e) {
      console.warn('Failed to set DNS order:', e);
    }
  }
}
