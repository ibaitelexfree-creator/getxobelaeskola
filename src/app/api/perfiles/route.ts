import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { xp, nivel_inicial, onboarding_completed, nombre, apellidos, telefono } = body;

        // Prepare update object with allowed fields
        const updateData: any = {};
        if (xp !== undefined) updateData.xp = xp;
        if (nombre !== undefined) updateData.nombre = nombre;
        if (apellidos !== undefined) updateData.apellidos = apellidos;
        if (telefono !== undefined) updateData.telefono = telefono;

        // Note: 'nivel_inicial' and 'onboarding_completed' are not in profiles schema yet.
        // If we want to store them, we might need to update user metadata or ignore them.
        // For now, we'll just log them if present and proceed with updating valid fields.
        if (nivel_inicial) {
             console.log(`User ${user.id} completed onboarding with level: ${nivel_inicial}`);
             // Potentially update user metadata here if needed
             // await supabase.auth.updateUser({ data: { level: nivel_inicial, onboarding_completed: true } });
        }

        if (Object.keys(updateData).length === 0) {
             return NextResponse.json({ message: 'No valid fields to update' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ profile: data, success: true });
    } catch (error) {
        console.error('Error in perfiles route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
