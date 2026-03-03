export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const dns = await import('node:dns');
      if (dns && typeof dns.setDefaultResultOrder === 'function') {
        dns.setDefaultResultOrder('ipv4first');
      }
    } catch (err) {
      // Quietly fail if dns module is not available or method is missing
    }
  }
}
