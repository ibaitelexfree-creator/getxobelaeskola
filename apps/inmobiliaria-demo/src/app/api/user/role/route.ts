
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserRole } from '@/lib/user-sync';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ role: 'guest' });
        }

        const role = await getUserRole(user.id);
        return NextResponse.json({ role });
    } catch (error) {
        return NextResponse.json({ role: 'guest' }, { status: 500 });
    }
}
