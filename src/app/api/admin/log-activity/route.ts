import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
<<<<<<< HEAD
        const auth = await requireInstructor();
        if (auth.error) return auth.error;
        const { user: requester, supabaseAdmin } = auth;
=======
        const { user: requester, supabaseAdmin, error: authError } = await requireInstructor();
        if (authError) return authError;
>>>>>>> pr-286

        const { action_type, target_id, target_type, description, metadata } = await request.json();

        // 3. Insert Log
        const { error } = await supabaseAdmin.from('audit_logs').insert({
            staff_id: requester.id,
            action_type,
            target_id,
            target_type,
            description,
            metadata
        });

        if (error) {
            console.error('DATABASE LOGGING ERROR:', error);
        } else {
            // console.log(`LOGGED: ${action_type} by ${requester.email}`);
        }

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        console.error('CRITICAL LOGGING API ERROR:', err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
