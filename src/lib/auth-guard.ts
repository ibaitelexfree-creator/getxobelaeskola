
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export type UserRole = 'admin' | 'instructor' | 'student' | 'user';

export async function checkAuth() {
    // MOCK PARA AUDITORÍA VISUAL - No requiere base de datos activa
    const user = {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'auditor@getxobelaeskola.com'
    };
    const profile = {
        id: user.id,
        rol: 'admin',
        nombre: 'Audit Mode',
        avatar_url: null
    };

    return {
        user,
        profile,
        supabaseAdmin: null as any,
        supabase: null as any,
        error: null
    };
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
