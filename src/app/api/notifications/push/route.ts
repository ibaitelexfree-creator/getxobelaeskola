import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/notifications/push-notification';

export async function POST(request: Request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, body, userId, data } = await request.json();

        // If userId is provided, ensure the current user is admin OR sending to themselves
        // For simplicity here, assuming user sends to themselves (for the achievement use case)
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

        const result = await sendPushNotification(targetUserId, {
            title,
            body,
            data
        });

        if (!result.success) {
            if (result.reason === 'no_tokens') {
                return NextResponse.json({ error: 'User has no FCM tokens' }, { status: 404 });
            }
            return NextResponse.json({ error: result.reason || 'Failed to send notification' }, { status: 500 });
        }

        return NextResponse.json({ success: true, result });

    } catch (error) {
        console.error('Error sending push notification:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
