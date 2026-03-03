import { requireAdmin } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { supabaseAdmin, error: authError } = await requireAdmin();
        if (authError) return authError;

        const { userId, email, nombre, apellidos, telefono } = await request.json();

        // 2. Update Auth (Email) if provided
        if (email) {
            const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, { email });
            if (authError) throw authError;
        }

        // 3. Update Profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                nombre,
                apellidos,
                telefono,
                email // We also keep it in profiles for easy display
            })
            .eq('id', userId);

        if (profileError) throw profileError;

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('STAFF UPDATE ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
