import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { meta_titulacion } = body;

        const supabaseAdmin = createAdminClient();

        // Update profile
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
                onboarding_completed: true,
                meta_titulacion: meta_titulacion || null
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('Error updating profile:', updateError);
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        // Award 'marino-novel' badge
        // First check if the badge exists
        const { data: badge } = await supabaseAdmin
            .from('logros')
            .select('id')
            .eq('slug', 'marino-novel')
            .single();

        if (badge) {
            // Check if user already has it
            const { data: existingBadge } = await supabaseAdmin
                .from('logros_alumno')
                .select('id')
                .eq('alumno_id', user.id)
                .eq('logro_id', badge.id)
                .single();

            if (!existingBadge) {
                await supabaseAdmin
                    .from('logros_alumno')
                    .insert({
                        alumno_id: user.id,
                        logro_id: badge.id
                    });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error completing onboarding:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
