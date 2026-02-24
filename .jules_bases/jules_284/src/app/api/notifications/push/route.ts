import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';

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

        // Get FCM token
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('fcm_token')
            .eq('id', targetUserId)
            .single();

        if (profileError || !profile?.fcm_token) {
             return NextResponse.json({ error: 'User has no FCM token' }, { status: 404 });
        }

        if (!firebaseAdmin.apps.length) {
             return NextResponse.json({ error: 'Firebase not initialized' }, { status: 503 });
        }

        const message = {
            token: profile.fcm_token,
            notification: {
                title,
                body,
            },
            data: data || {},
        };

        const response = await firebaseAdmin.messaging().send(message);

        return NextResponse.json({ success: true, messageId: response });

    } catch (error) {
        console.error('Error sending push notification:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
