export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      // Using eval('require') to hide the node-only module from the bundler
      // during the Edge/Cloudflare build phase.
      const dns = eval('require')('node:dns');
      if (dns && dns.setDefaultResultOrder) {
        dns.setDefaultResultOrder('ipv4first');
      }
    } catch (e) {
      // Gracefully handle cases where the module might still be missing
    }
  }
}
