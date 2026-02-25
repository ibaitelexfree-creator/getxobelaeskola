import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

let supabaseBrowserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
    if (supabaseBrowserClient) return supabaseBrowserClient;

    supabaseBrowserClient = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    );

    return supabaseBrowserClient;
}
