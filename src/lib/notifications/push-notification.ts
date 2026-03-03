import { createAdminClient } from '@/lib/supabase/admin';

export interface PushNotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

/**
 * Sends a push notification to all devices associated with a user.
 * It checks both the 'user_devices' table (multiple devices) and
 * the 'profiles' table (legacy/backup).
 */
export async function sendPushNotification(
    userId: string,
    payload: PushNotificationPayload
) {
    try {
        const supabase = createAdminClient();

        // 1. Get tokens from user_devices
        const { data: devices, error: devicesError } = await supabase
            .from('user_devices')
            .select('fcm_token')
            .eq('user_id', userId);

        if (devicesError) {
            console.error(`Error fetching user devices for ${userId}:`, devicesError);
        }

        // 2. Get token from profiles (legacy/backup)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('fcm_token')
            .eq('id', userId)
            .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is 'no rows returned'
            console.error(`Error fetching profile for ${userId}:`, profileError);
        }

        // 3. Consolidate unique tokens
        const tokenSet = new Set<string>();

        devices?.forEach(d => {
            if (d.fcm_token) tokenSet.add(d.fcm_token);
        });

        if (profile?.fcm_token) {
            tokenSet.add(profile.fcm_token);
        }

        const tokens = Array.from(tokenSet);

        if (tokens.length === 0) {
            console.info(`No FCM tokens found for user ${userId}. Skipping push notification.`);
            return { success: false, reason: 'no_tokens' };
        }

        // 4. Import and check Firebase Admin
        const { firebaseAdmin } = await import('@/lib/firebase-admin');

        if (!firebaseAdmin.apps.length) {
            console.error('Firebase Admin not initialized. Cannot send push notification.');
            return { success: false, reason: 'firebase_not_initialized' };
        }

        // 5. Send notification
        const message = {
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data || {},
            tokens: tokens,
        };

        const response = await firebaseAdmin.messaging().sendEachForMulticast(message);

        console.log(`Successfully sent ${response.successCount} push notifications for user ${userId}.`);
        if (response.failureCount > 0) {
            console.warn(`Failed to send ${response.failureCount} push notifications for user ${userId}.`);
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    console.error(`Error sending to token ${tokens[idx]}:`, resp.error);
                }
            });
        }

        return {
            success: response.successCount > 0,
            successCount: response.successCount,
            failureCount: response.failureCount
        };

    } catch (error) {
        console.error('Unexpected error in sendPushNotification:', error);
        return { success: false, reason: 'error', error };
    }
}
