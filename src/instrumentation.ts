export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const dns = await import('dns');
    if (dns.setDefaultResultOrder) {
      dns.setDefaultResultOrder('ipv4first');
    }
  }
}
