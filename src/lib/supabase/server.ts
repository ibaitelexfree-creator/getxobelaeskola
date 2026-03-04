import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'





export function createClient() {
    // Prevent build crashes if keys are missing (CI/Build context)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

    if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
        console.warn('Supabase keys missing or invalid. Using mock client for build.');
        // Return a mock-ish client that doesn't actually hit the network violently
        return {
            from: (table) => {
                const chain = {
                    select: () => chain,
                    eq: () => chain,
                    in: () => chain,
                    order: () => chain,
                    limit: () => chain,
                    single: () => chain,
                    insert: () => chain,
                    update: () => chain,
                    delete: () => chain,
                    then: (resolve) => resolve({ data: [], error: null })
                };
                return chain;
            },
            auth: {
                getUser: async () => ({ data: { user: null }, error: null }),
                getSession: async () => ({ data: { session: null }, error: null })
            }
        };
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
