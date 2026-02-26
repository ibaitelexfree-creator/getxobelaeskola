import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase env vars missing in server.ts! This may cause issues during SSG or server-side usage.');
    }

    let cookieStore;
    try {
        cookieStore = cookies();
    } catch {
        // Fallback for static generation / build time
        // This allows the build to proceed for public pages
        return createServerClient<Database>(
            supabaseUrl || '',
            supabaseKey || '',
            {
                cookies: {
                    getAll() { return [] },
                    setAll() { },
                },
            }
        );
    }

    return createServerClient<Database>(
        supabaseUrl || '',
        supabaseKey || '',
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            },
        }
    )
}
