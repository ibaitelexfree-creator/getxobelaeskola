import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth-guard';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { user: requester, profile: requesterProfile, error: authError, supabase } = await checkAuth();

    if (authError || !requester) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Allow users to only see their own profile, or admins to see any profile
    const isOwner = requester.id === userId;
    const isAdmin = requesterProfile?.rol === 'admin';

    if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
