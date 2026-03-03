import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/notifications/push-service';

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

        const result = await sendPushNotification({
            userId: targetUserId,
            title,
            body,
            data: data || {},
        });

        if (!result.success) {
            return NextResponse.json({
                error: result.reason || 'Failed to send push notification',
                details: result.error
            }, { status: result.reason === 'no_tokens' ? 404 : 500 });
        }

        return NextResponse.json({
            success: true,
            successCount: result.successCount,
            failureCount: result.failureCount
        });

    } catch (error) {
        console.error('Error in push notification API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
