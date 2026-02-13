
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export type UserRole = 'admin' | 'instructor' | 'student' | 'user';

export async function checkAuth() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) };
    }

    const supabaseAdmin = createAdminClient();
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile) {
        return { error: NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 }) };
    }

    return { user, profile, supabaseAdmin, supabase };
}

export async function requireAuth() {
    return await checkAuth();
}

export async function requireAdmin() {
    const { user, profile, supabaseAdmin, error } = await checkAuth();
    if (error) return { error };

    if (profile.rol !== 'admin') {
        return { error: NextResponse.json({ error: 'Acceso restringido a administradores' }, { status: 403 }) };
    }

    return { user, profile, supabaseAdmin };
}

export async function requireInstructor() {
    const { user, profile, supabaseAdmin, error } = await checkAuth();
    if (error) return { error };

    if (profile.rol !== 'admin' && profile.rol !== 'instructor') {
        return { error: NextResponse.json({ error: 'Acceso restringido a instructores o administradores' }, { status: 403 }) };
    }

    return { user, profile, supabaseAdmin };
}
