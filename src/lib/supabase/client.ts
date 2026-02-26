import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

let supabaseBrowserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
    if (supabaseBrowserClient) return supabaseBrowserClient;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    supabaseBrowserClient = createBrowserClient<Database>(
        supabaseUrl,
        supabaseKey
    );

    return supabaseBrowserClient;
}
