import { createBrowserClient } from '@supabase/ssr'

let supabaseBrowserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
    if (typeof window === 'undefined') return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    if (supabaseBrowserClient) return supabaseBrowserClient;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
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

    supabaseBrowserClient = createBrowserClient(url, key);
    return supabaseBrowserClient;
}
