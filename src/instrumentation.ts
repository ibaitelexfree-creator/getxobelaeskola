export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const dns = await import('node:dns');
      if (dns.setDefaultResultOrder) {
        dns.setDefaultResultOrder('ipv4first');
      }
    } catch (e) {
      console.warn('Failed to load node:dns in instrumentation', e);
    }
  }
}
