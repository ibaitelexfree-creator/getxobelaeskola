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

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const isMock = !url || url.includes('placeholder') || !key || key.includes('placeholder') || key.length < 20;

    const mockFetch = async () => new Response(JSON.stringify({ data: [], error: null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });

    supabaseAdmin = createClient<Database>(
        url || 'https://placeholder.supabase.co',
        key || 'placeholder',
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            },
            global: isMock ? { fetch: mockFetch as any } : undefined
        }
    );
    return supabaseAdmin;
}
