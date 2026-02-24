import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
    let cookieStore;
    try {
        cookieStore = cookies();
    } catch {
        // Fallback for static generation / build time
        // This allows the build to proceed for public pages
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

        return createServerClient(
            url,
            key,
            {
                cookies: {
                    getAll() { return [] },
                    setAll() { },
                },
            }
        );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.warn('Supabase env vars missing in createClient (server).');
        // Return dummy client to avoid crash
        return createServerClient(
            url || 'https://placeholder.supabase.co',
            key || 'placeholder-key',
            {
                cookies: {
                    getAll() { return [] },
                    setAll() { },
                }
            }
        );
    }

    return createServerClient(
        url,
        key,
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
