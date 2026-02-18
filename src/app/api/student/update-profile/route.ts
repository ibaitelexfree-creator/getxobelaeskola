import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { nombre, apellidos, telefono } = body;

        // Basic validation
        if (!nombre) {
            return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('profiles')
            .update({
                nombre,
                apellidos,
                telefono
            })
            .eq('id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ profile: data, success: true });
    } catch (error) {
        console.error('Error in update-profile route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
