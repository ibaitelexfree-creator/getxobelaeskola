export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      // Use require to ensure it's not bundled for Edge/browser
      const dns = require('node:dns');
      if (dns && dns.setDefaultResultOrder) {
        dns.setDefaultResultOrder('ipv4first');
      }
    } catch (error) {
      console.warn('Failed to set DNS result order:', error);
    }
  }
}
