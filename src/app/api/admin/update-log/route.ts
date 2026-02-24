import { requireAdmin } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const auth = await requireAdmin();
        if (auth.error) return auth.error;
        const { supabaseAdmin } = auth;

        const { logId, description, metadata, target_id, target_type } = await request.json();

        // 2. Update Log
        const { error } = await supabaseAdmin
            .from('audit_logs')
            .update({
                description,
                metadata,
                target_id,
                target_type
            })
            .eq('id', logId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('LOG UPDATE ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
