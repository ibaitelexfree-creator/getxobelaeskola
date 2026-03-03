import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { public_profile } = await request.json();

        if (typeof public_profile !== 'boolean') {
            return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
        }

        const { error } = await supabase
            .from('profiles')
            .update({ public_profile })
            .eq('id', user.id);

        if (error) {
            console.error('Error updating privacy:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('CRITICAL: Error updating privacy:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
