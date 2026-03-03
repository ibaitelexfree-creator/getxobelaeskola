import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = createClient();

    // Check if the requester is authenticated
    const { data: { user: requester }, error: authError } = await supabase.auth.getUser();

    if (authError || !requester) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const { data: profile, error } = await supabase
        .from('profiles')
      .select('id, rol, nombre, status_socio')
        .eq('id', userId)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
}
