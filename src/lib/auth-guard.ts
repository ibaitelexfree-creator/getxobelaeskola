<<<<<<< HEAD
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SupabaseClient, User, AuthError } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
=======

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
>>>>>>> pr-286
import { NextResponse } from 'next/server';

export type UserRole = 'admin' | 'instructor' | 'student' | 'user';

<<<<<<< HEAD
export interface Profile {
    id: string;
    rol: UserRole;
    nombre: string;
    apellidos: string;
    [key: string]: unknown;
}

export async function checkAuth(): Promise<{
    user: User | null;
    profile: Profile | null;
    supabaseAdmin: SupabaseClient<Database> | null;
    supabase: SupabaseClient<Database>;
    error: AuthError | { message: string } | null;
}> {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { user: null, profile: null, supabaseAdmin: null, supabase, error: authError || { message: 'No autenticado' } };
    }

    const supabaseAdmin = createAdminClient();
    const { data: profile, error: profileError } = await supabaseAdmin
=======
export async function checkAuth() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) };
    }

    const supabaseAdmin = createAdminClient();
    const { data: profile } = await supabaseAdmin
>>>>>>> pr-286
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

<<<<<<< HEAD
    return { user, profile: profile as Profile | null, supabaseAdmin, supabase, error: (profileError as unknown as AuthError) || null };
}



=======
    if (!profile) {
        return { error: NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 }) };
    }

    return { user, profile, supabaseAdmin, supabase };
}

>>>>>>> pr-286
export async function requireAuth() {
    return await checkAuth();
}

<<<<<<< HEAD
export async function requireAdmin(): Promise<
    | { user: User; profile: Profile; supabaseAdmin: SupabaseClient<Database>; error: null }
    | { user: null; profile: null; supabaseAdmin: null; error: NextResponse }
> {
    const { user, profile, supabaseAdmin, error } = await checkAuth();
    if (error || !profile || !user || !supabaseAdmin) {
        return {
            user: null,
            profile: null,
            supabaseAdmin: null,
            error: NextResponse.json({ error: (error as any)?.message || 'No autorizado' }, { status: 401 })
        };
    }

    if (profile.rol !== 'admin') {
        return {
            user: null,
            profile: null,
            supabaseAdmin: null,
            error: NextResponse.json({ error: 'Acceso restringido a administradores' }, { status: 403 })
        };
    }

    return { user, profile, supabaseAdmin, error: null };
}

export async function requireInstructor(): Promise<
    | { user: User; profile: Profile; supabaseAdmin: SupabaseClient<Database>; error: null }
    | { user: null; profile: null; supabaseAdmin: null; error: NextResponse }
> {
    const { user, profile, supabaseAdmin, error } = await checkAuth();
    if (error || !profile || !user || !supabaseAdmin) {
        return {
            user: null,
            profile: null,
            supabaseAdmin: null,
            error: NextResponse.json({ error: (error as any)?.message || 'No autorizado' }, { status: 401 })
        };
    }

    if (profile.rol !== 'admin' && profile.rol !== 'instructor') {
        return {
            user: null,
            profile: null,
            supabaseAdmin: null,
            error: NextResponse.json({ error: 'Acceso restringido a instructores o administradores' }, { status: 403 })
        };
    }

    return { user, profile, supabaseAdmin, error: null };
=======
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
>>>>>>> pr-286
}
