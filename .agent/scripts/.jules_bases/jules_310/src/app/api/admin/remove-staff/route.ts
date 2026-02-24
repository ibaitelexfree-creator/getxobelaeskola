import { requireAdmin } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { supabaseAdmin, error: authError } = await requireAdmin();
        if (authError) return authError;

        const { userId } = await request.json();
        if (!userId) return NextResponse.json({ error: 'Falta userId' }, { status: 400 });

        // Option A: Delete the user entirely from Auth and Database
        // This is usually what "Dar de Baja" means for staff access
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) throw deleteError;

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const error = err as Error;
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
