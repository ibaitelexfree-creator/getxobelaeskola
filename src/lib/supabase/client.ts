import { createBrowserClient } from '@supabase/ssr'

let supabaseBrowserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (typeof window === 'undefined') {
        // Server-side: gracefully handle missing env vars to prevent build crashes
        if (!url || !key) {
            console.warn('Supabase env vars missing during server-side render/build.');
            // Return a mock client or throw a more descriptive error if critical
            // For build safety, we return a mock that does nothing
            return {
                auth: {
                    getUser: async () => ({ data: { user: null }, error: null }),
                    getSession: async () => ({ data: { session: null }, error: null }),
                    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } })
                },
                from: () => ({
                    select: () => ({
                        eq: () => ({
                            single: async () => ({ data: null, error: null }),
                            order: () => ({ limit: () => ({ single: async () => ({ data: null, error: null }) }) })
                        })
                    })
                })
            } as unknown as ReturnType<typeof createBrowserClient>;
        }
        return createBrowserClient(url, key);
    }

    // Client-side:
    if (supabaseBrowserClient) return supabaseBrowserClient;

    if (!url || !key) {
        console.error('Supabase env vars missing on client.');
        // Return a mock to prevent crash, but app won't work
        return {
            auth: {
                getUser: async () => ({ data: { user: null }, error: null }),
                getSession: async () => ({ data: { session: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } })
            }
        } as unknown as ReturnType<typeof createBrowserClient>;
    }

    supabaseBrowserClient = createBrowserClient(url, key);
    return supabaseBrowserClient;
}
