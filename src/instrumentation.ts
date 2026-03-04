export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      // Use dynamic import to avoid bundling issues in Edge runtimes
      const dns = await import('node:dns');
      if (dns && dns.setDefaultResultOrder) {
        dns.setDefaultResultOrder('ipv4first');
      }
    } catch (e) {
      // Fallback or ignore if node:dns is not available
    }
  }
}
