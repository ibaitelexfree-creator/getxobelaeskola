import { requireAuth } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { user, supabase, error: authError } = await requireAuth();
        if (authError) return authError;

        const body = await request.json();
        const { nombre, apellidos, telefono } = body;

        // Validate basic inputs (nombre is required based on profiles table)
        if (!nombre) {
            return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
        }

        // Update profile
        const { data, error } = await supabase
            .from('profiles')
            .update({ nombre, apellidos, telefono })
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, profile: data });
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
