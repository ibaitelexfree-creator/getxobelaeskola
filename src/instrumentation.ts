export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const dns = await import('node:dns');
      if (dns && dns.setDefaultResultOrder) {
        dns.setDefaultResultOrder('ipv4first');
      }
    } catch (e) {
      // Ignore errors in environments where node:dns is not available
    }
  }
}
