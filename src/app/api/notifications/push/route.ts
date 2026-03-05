import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { PushService } from '@/lib/notifications/PushService';

export async function POST(request: Request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, body, userId, data } = await request.json();

        // If userId is provided, ensure the current user is admin OR sending to themselves
        const targetUserId = userId || user.id;

        if (targetUserId !== user.id) {
            // Check if user is admin if they try to send to others
             const { data: profile } = await supabase
                .from('profiles')
                .select('rol')
                .eq('id', user.id)
                .single();

            if (profile?.rol !== 'admin') {
                 return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const result = await PushService.sendToUser(targetUserId, title, body, data);

        if (!result.success) {
             return NextResponse.json({ error: result.error || 'Failed to send push notification' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            sentCount: result.sentCount,
            failureCount: result.failureCount
        });

    } catch (error) {
        console.error('Error in Push API Route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
