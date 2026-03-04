import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Safety check for build time in CI/Docker environments
    if (!url || !key) {
        // Return a proxy or a minimal object that won't crash on instantiation
        // but might crash if auth methods are called during SSR without variables.
        // For build purposes, this allows the module to be loaded.
        return {} as any;
    }

    return createBrowserClient(url, key)
}
