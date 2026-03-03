import { createAdminClient } from '@/lib/supabase/admin';
import { firebaseAdmin } from '@/lib/firebase-admin';

export interface PushNotificationData {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, string>;
}

/**
 * Sends push notifications to all registered devices of a user.
 * It fetches tokens from both 'user_devices' and 'profiles' tables.
 */
export async function sendPushNotification({ userId, title, body, data }: PushNotificationData) {
    const supabase = createAdminClient();

    try {
        // 1. Get tokens from user_devices
        const { data: devices, error: devicesError } = await supabase
            .from('user_devices')
            .select('fcm_token')
            .eq('user_id', userId);

        if (devicesError) {
            console.error('Error fetching user devices:', devicesError);
        }

        // 2. Get token from profiles (legacy support)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('fcm_token')
            .eq('id', userId)
            .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is 'no rows returned'
            console.error('Error fetching user profile token:', profileError);
        }

        const tokens = new Set<string>();

        if (devices) {
            devices.forEach(d => {
                if (d.fcm_token) tokens.add(d.fcm_token);
            });
        }

        if (profile?.fcm_token) {
            tokens.add(profile.fcm_token);
        }

        if (tokens.size === 0) {
            console.log(`No push tokens found for user ${userId}`);
            return { success: false, reason: 'no_tokens' };
        }

        if (!firebaseAdmin.apps.length) {
            console.warn('Firebase Admin not initialized, skipping push notification');
            return { success: false, reason: 'firebase_not_initialized' };
        }

        const messages = Array.from(tokens).map(token => ({
            token,
            notification: {
                title,
                body,
            },
            data: data || {},
        }));

        // Send to all tokens
        const response = await firebaseAdmin.messaging().sendEach(messages);

        console.log(`Push notifications sent to user ${userId}: ${response.successCount} success, ${response.failureCount} failure`);

        return {
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount
        };
    } catch (error) {
        console.error('Unexpected error in sendPushNotification:', error);
        return { success: false, error };
    }
}
