import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

let supabaseBrowserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
    if (supabaseBrowserClient) return supabaseBrowserClient;


    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    // Create a mocked fetch so Next.js doesn't crash during SSG/build when using a dummy URL
    const mockFetch = async () => new Response(JSON.stringify({ data: [], error: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });

    supabaseBrowserClient = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
        isMock ? { global: { fetch: mockFetch as any } } : undefined
    );

    return supabaseBrowserClient;
}
