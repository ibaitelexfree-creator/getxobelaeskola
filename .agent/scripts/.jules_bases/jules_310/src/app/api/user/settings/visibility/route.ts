import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { withCors, corsHeaders } from '@/lib/api-headers';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: Request) {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders(request)
    });
}

export async function POST(request: Request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return withCors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), request);
        }

        const body = await request.json();
        const { is_public } = body;

        if (typeof is_public !== 'boolean') {
            return withCors(NextResponse.json({ error: 'Invalid payload' }, { status: 400 }), request);
        }

        // Attempt to update 'profiles' table
        const { error: dbError } = await supabase
            .from('profiles')
            .update({ is_public_profile: is_public })
            .eq('id', user.id);

        if (dbError) {
            console.error('Error updating profiles table (schema might be missing column):', dbError);

            // Fallback: Update auth metadata (though this won't be queryable by other users easily via public API unless we change the fetch logic)
            // But since the fetch logic in `profile/[userId]` relies on `profiles` table, this fallback is mostly for "saving user preference"
            // even if it doesn't immediately enable the public view if the column is missing.
            const { error: authUpdateError } = await supabase.auth.updateUser({
                data: { is_public_profile: is_public }
            });

            if (authUpdateError) {
                console.error('Error updating auth metadata:', authUpdateError);
                return withCors(NextResponse.json({ error: 'Failed to update visibility' }, { status: 500 }), request);
            }

            // Warn the frontend that it might not have fully worked on the public side
            return withCors(NextResponse.json({
                success: true,
                warning: 'Saved to preferences, but public profile might not be active due to database schema limitations.'
            }), request);
        }

        return withCors(NextResponse.json({ success: true }), request);

    } catch (error) {
        console.error('Error in visibility settings:', error);
        return withCors(NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }), request);
    }
}
