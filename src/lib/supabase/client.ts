import { createBrowserClient } from '@supabase/ssr'

let supabaseBrowserClient: any = null;

export function createClient() {
    if (supabaseBrowserClient) return supabaseBrowserClient;

    supabaseBrowserClient = createBrowserClient<any>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    return supabaseBrowserClient;
}
