export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const dns = require('dns');
    if (dns.setDefaultResultOrder) {
      dns.setDefaultResultOrder('ipv4first');
    }
  }
}
