export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Avoid dynamic import/require in build/instrumentation to keep Edge runtime happy
    // and prevent potential issues with module resolution in certain environments.
    // If we really need this, we should find a more robust way to set it.
  }
}
