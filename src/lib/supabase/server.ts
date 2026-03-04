import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export function createClient() {
    // Prevent build crashes if keys are missing (CI/Build context)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

    // Check if we are running in a CI/Build context with dummy values
    const isMock = url.includes('127.0.0.1') || url.includes('placeholder') || key.includes('placeholder');

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
            global: {
                // If it's a mock build environment, override fetch to immediately return empty data
                // to prevent ECONNREFUSED during Next.js static generation
                fetch: isMock ? async () => new Response(JSON.stringify([]), { status: 200 }) : fetch
            }
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
        global: {
            fetch: isMock ? async () => new Response(JSON.stringify([]), { status: 200 }) : fetch
        }
    })
}
