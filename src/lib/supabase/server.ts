import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export function createClient() {
    // Prevent build crashes if keys are missing (CI/Build context)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key || url.includes('placeholder') || key.includes('placeholder') || key.length < 20) {
        const mockedFetch = async () => {
            return new Response(JSON.stringify({ data: [], error: null }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        };

        return createServerClient<Database>(
            url || 'https://placeholder.supabase.co',
            key || 'placeholder',
            {
                global: { fetch: mockedFetch as any },
                cookies: {
                    getAll() { return [] },
                    setAll() { },
                },
            }
        );

    }

    let cookieStore;
    try {
        cookieStore = cookies();
    } catch {
        // Fallback for static generation / build time
        return createServerClient<Database>(url, key, {
            cookies: {
                getAll() { return [] },
                setAll() { },
            },
        });
    }

    return createServerClient<Database>(url, key, {
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
    })
}
