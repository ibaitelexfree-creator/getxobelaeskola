
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { setDefaultResultOrder } = await import('node:dns');
      setDefaultResultOrder('ipv4first');
    } catch (e) {
      console.error('Failed to set DNS order:', e);
    }
  }
}
