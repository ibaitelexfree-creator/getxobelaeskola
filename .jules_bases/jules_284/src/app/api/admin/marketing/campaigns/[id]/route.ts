import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createAdminClient() as any;
        const body = await request.json();
        const { data, error } = await supabase
            .from('marketing_campaigns')
            .update(body as any)
            .eq('id', params.id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ campaign: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createAdminClient() as any;
        const { error } = await supabase
            .from('marketing_campaigns')
            .delete()
            .eq('id', params.id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
