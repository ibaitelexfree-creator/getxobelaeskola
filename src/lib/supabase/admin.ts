import { createClient } from '@supabase/supabase-js';

/**
 * Crea un cliente de Supabase con Service Role (ADMIN).
 * USAR CON PRECAUCIÓN: Salta todas las políticas RLS.
 * Solo para uso en API Routes (Server Side) y nunca exponer al cliente.
 */
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

export function createAdminClient() {
    if (supabaseAdmin) return supabaseAdmin;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_role_key';

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY is missing. Using placeholder for build safety.');
    }

    supabaseAdmin = createClient(
        supabaseUrl,
        supabaseKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
    return supabaseAdmin;
}
