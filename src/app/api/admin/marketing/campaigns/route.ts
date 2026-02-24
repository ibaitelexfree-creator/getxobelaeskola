import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('marketing_campaigns')
            .select(`
                *,
                trigger_course:curso_trigger_id(nombre_es),
                target_course:curso_objetivo_id(nombre_es)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ campaigns: data });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = createAdminClient();
        const body = await request.json();
        const { data, error } = await supabase
            .from('marketing_campaigns')
            .insert([body])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ campaign: data });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
