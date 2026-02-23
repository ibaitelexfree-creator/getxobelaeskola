import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Crea un cliente de Supabase con Service Role (ADMIN).
 * USAR CON PRECAUCIÓN: Salta todas las políticas RLS.
 * Solo para uso en API Routes (Server Side) y nunca exponer al cliente.
 */
let supabaseAdmin: SupabaseClient<any> | null = null;

export function createAdminClient() {
    if (supabaseAdmin) return supabaseAdmin;

    supabaseAdmin = createClient<any>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
    return supabaseAdmin;
}
