import { createClient } from '@supabase/supabase-js';

/**
 * Crea un cliente de Supabase con Service Role (ADMIN).
 * USAR CON PRECAUCIÓN: Salta todas las políticas RLS.
 * Solo para uso en API Routes (Server Side) y nunca exponer al cliente.
 */
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

export function createAdminClient() {
    if (supabaseAdmin) return supabaseAdmin;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        if (process.env.NODE_ENV === 'production') {
            console.warn('Supabase Admin env vars missing. Admin features will fail.');
        }
        // Return a mock or throw?
        // Returning a mock prevents build crash if this is called during build.
        // But throwing is better for runtime logic.
        // Let's check if we are in build context (usually NODE_ENV=production but CI might not set it identically).
        // Safest is to return a dummy client that throws on calls, or just valid string placeholders if strictly required by constructor.

        // createClient requires valid URL format usually.
        // If we just want to avoid build crash:
        if (!url) console.warn('NEXT_PUBLIC_SUPABASE_URL missing');
        if (!key) console.warn('SUPABASE_SERVICE_ROLE_KEY missing');

        // Fallback to avoid crash on init
        return createClient(
            url || 'https://placeholder.supabase.co',
            key || 'placeholder-key',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );
    }

    supabaseAdmin = createClient(
        url,
        key,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
    return supabaseAdmin;
}
