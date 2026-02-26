
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export type UserRole = 'admin' | 'instructor' | 'student' | 'user';

export async function checkAuth(): Promise<{
    user: any;
    profile: { rol: UserRole;[key: string]: any } | null;
    supabaseAdmin: any;
    supabase: any;
    error: any;
}> {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { user: null, profile: null, supabaseAdmin: null, supabase, error: authError || { message: 'No session', status: 401 } };
    }

    const supabaseAdmin = createAdminClient();
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return { user, profile: profile as any, supabaseAdmin, supabase, error: profileError || null };
}



export async function requireAuth() {
    return await checkAuth();
}

export async function requireAdmin() {
    const { user, profile, supabaseAdmin, error } = await checkAuth();
    if (error || !profile) {
        return { error: NextResponse.json({ error: error?.message || 'Perfil no encontrado' }, { status: 401 }) };
    }

    if (profile.rol !== 'admin') {
        return { error: NextResponse.json({ error: 'Acceso restringido a administradores' }, { status: 403 }) };
    }

    return { user, profile, supabaseAdmin };
}

export async function requireInstructor() {
    const { user, profile, supabaseAdmin, error } = await checkAuth();
    if (error || !profile) {
        return { error: NextResponse.json({ error: error?.message || 'Perfil no encontrado' }, { status: 401 }) };
    }

    if (profile.rol !== 'admin' && profile.rol !== 'instructor') {
        return { error: NextResponse.json({ error: 'Acceso restringido a instructores o administradores' }, { status: 403 }) };
    }

    return { user, profile, supabaseAdmin };
}
