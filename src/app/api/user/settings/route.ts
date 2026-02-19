import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { animations_enabled } = body;

        if (typeof animations_enabled !== 'boolean') {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // Update profile
        // Update user metadata (auth.users)
        const { error: updateError } = await supabase.auth.updateUser({
            data: { preferences: { animations_enabled } }
        });

        if (updateError) {
            // Fallback: If 'preferences' column doesn't exist or is not JSONB, 
            // we might fail. For now assuming it exists or we just ignore if schema is different.
            // If the column 'preferences' is not in the schema, this will fail.
            // Let's assume there is a column for it or we should add one.
            // Given I cannot migrate DB freely, I will try to update generic metadata if profiles fails
            // Or just log error.
            console.error('Error updating profile:', updateError);
            return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in settings route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
