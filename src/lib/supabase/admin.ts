import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

/**
 * Crea un cliente de Supabase con Service Role (ADMIN).
 * USAR CON PRECAUCIÓN: Salta todas las políticas RLS.
 * Solo para uso en API Routes (Server Side) y nunca exponer al cliente.
 */
let supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

export function createAdminClient() {
    if (supabaseAdmin) return supabaseAdmin;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

    // Prevent network hang during CI builds with dummy endpoints
    const isMock = url.includes('127.0.0.1') || url.includes('placeholder');

    supabaseAdmin = createClient<Database>(
        url,
        key,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            },
            global: {
                // If it's a mock build environment, override fetch to immediately return empty data
                // to prevent ECONNREFUSED during Next.js static generation
                fetch: isMock ? async () => new Response(JSON.stringify([]), { status: 200 }) : fetch
            }
        }
    );
    return supabaseAdmin;
}
