import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

let supabaseBrowserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
    if (supabaseBrowserClient) return supabaseBrowserClient;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const isMock = !url || url.includes('placeholder') || !key || key.includes('placeholder') || key.length < 20;

    const mockFetch = async () => new Response(JSON.stringify({ data: [], error: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });

    supabaseBrowserClient = createBrowserClient<Database>(
        url || 'https://placeholder.supabase.co',
        key || 'placeholder',
        isMock ? { global: { fetch: mockFetch as any } } : undefined
    );

    return supabaseBrowserClient;
}
