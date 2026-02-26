import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
<<<<<<< HEAD
        const auth = await requireInstructor();
        if (auth.error) return auth.error;
        const { profile, supabaseAdmin } = auth;
=======
        const { profile, supabaseAdmin, error: authError } = await requireInstructor();
        if (authError) return authError;
>>>>>>> pr-286

        const body = await request.json();
        const { title, content, scheduled_for, status } = body;

        if (!title || !content) {
            return NextResponse.json({ error: 'Título y contenido son obligatorios' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('newsletters')
            .insert({
                title,
                content,
                scheduled_for: scheduled_for || null,
                status: status || (scheduled_for ? 'scheduled' : 'sent'),
<<<<<<< HEAD
                created_by: profile?.id,
=======
                created_by: profile.id,
>>>>>>> pr-286
                sent_at: scheduled_for ? null : new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, newsletter: data });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
