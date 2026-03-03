export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Dynamically require dns only in Node.js runtime to avoid build errors on Cloudflare Pages/Edge
    const dns = require('node:dns');
    if (dns.setDefaultResultOrder) {
      dns.setDefaultResultOrder('ipv4first');
    }
  }
}
