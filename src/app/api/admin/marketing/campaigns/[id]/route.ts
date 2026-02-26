import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();
        const { data, error } = await supabase
            .from('marketing_campaigns')
            .update(body)
            .eq('id', params.id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ campaign: data });
<<<<<<< HEAD
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
=======
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
>>>>>>> pr-286
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from('marketing_campaigns')
            .delete()
            .eq('id', params.id);

        if (error) throw error;
        return NextResponse.json({ success: true });
<<<<<<< HEAD
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
=======
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
>>>>>>> pr-286
    }
}
