import { firebaseAdmin } from '@/lib/firebase-admin';
import { createAdminClient } from '@/lib/supabase/admin';

export class PushService {
    /**
     * Sends a push notification to all devices registered for a user.
     */
    static async sendToUser(userId: string, title: string, body: string, data?: Record<string, string>) {
        try {
            const supabase = createAdminClient();

            // 1. Fetch tokens from user_devices and profiles
            const [devicesRes, profileRes] = await Promise.all([
                supabase.from('user_devices').select('fcm_token').eq('user_id', userId),
                supabase.from('profiles').select('fcm_token').eq('id', userId).single()
            ]);

            const tokens = new Set<string>();

            if (devicesRes.data) {
                devicesRes.data.forEach(d => {
                    if (d.fcm_token) tokens.add(d.fcm_token);
                });
            }

            if (profileRes.data?.fcm_token) {
                tokens.add(profileRes.data.fcm_token);
            }

            if (tokens.size === 0) {
                console.log(`No push tokens found for user ${userId}`);
                return { success: true, sentCount: 0 };
            }

            const tokenList = Array.from(tokens);

            if (!firebaseAdmin.apps.length) {
                console.warn('Firebase Admin not initialized, skipping push notification');
                return { success: false, error: 'Firebase not initialized' };
            }

            // 2. Send multicast message
            const response = await firebaseAdmin.messaging().sendEachForMulticast({
                tokens: tokenList,
                notification: {
                    title,
                    body,
                },
                data: data || {},
            });

            console.log(`Push notification sent to user ${userId}. Success: ${response.successCount}, Failure: ${response.failureCount}`);

            // 3. Handle invalid tokens (Cleanup)
            const tokensToRemove: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const errorCode = resp.error?.code;
                    // Check for invalid or unregistered tokens
                    if (
                        errorCode === 'messaging/invalid-registration-token' ||
                        errorCode === 'messaging/registration-token-not-registered'
                    ) {
                        tokensToRemove.push(tokenList[idx]);
                    }
                }
            });

            if (tokensToRemove.length > 0) {
                console.log(`Removing ${tokensToRemove.length} invalid tokens for user ${userId}`);
                await supabase
                    .from('user_devices')
                    .delete()
                    .eq('user_id', userId)
                    .in('fcm_token', tokensToRemove);
            }

            return {
                success: true,
                sentCount: response.successCount,
                failureCount: response.failureCount
            };

        } catch (error) {
            console.error('Error in PushService.sendToUser:', error);
            return { success: false, error };
        }
    }
}
