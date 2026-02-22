import { requireAdmin } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';
import { boatSchema } from '@/lib/validators/boat';

export async function POST(request: Request) {
    try {
        const { supabaseAdmin, error: authError } = await requireAdmin();
        if (authError) return authError;

        const body = await request.json();

        const validation = boatSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
        }

        const { data: boatData } = validation;

        const { data, error } = await supabaseAdmin
            .from('embarcaciones')
            .insert(boatData)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, boat: data });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
