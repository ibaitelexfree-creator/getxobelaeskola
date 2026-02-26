import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
    try {
        const supabase = createAdminClient() as any;
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
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = createAdminClient() as any;
        const body = await request.json();
        const { data, error } = await supabase
            .from('marketing_campaigns')
            .insert([body])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ campaign: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
