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

    supabaseAdmin = createClient<Database>(
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
