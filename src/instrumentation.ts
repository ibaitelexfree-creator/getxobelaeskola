export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const dns = require('node:dns');
      if (dns && dns.setDefaultResultOrder) {
        dns.setDefaultResultOrder('ipv4first');
      }
    } catch (e) {
      // Ignore if node:dns is not available
    }
  }
}
