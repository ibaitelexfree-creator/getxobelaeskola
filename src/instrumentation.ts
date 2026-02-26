import dns from 'node:dns';

export async function register() {
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch (e) {
    console.error('Failed to set DNS order:', e);
  }
}
