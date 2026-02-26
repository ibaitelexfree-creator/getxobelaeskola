import { useEffect, useState, useCallback } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { createClient } from '@/lib/supabase/client';

export interface PushNotificationState {
    permission: PermissionState | 'prompt' | 'prompt-with-rationale';
    token?: string;
    error?: any;
    isNative: boolean;
}

export const usePushNotifications = () => {
    const [state, setState] = useState<PushNotificationState>({
        permission: 'prompt',
        isNative: false, // Start as false for SSR compatibility
    });

    // Handle isNative check on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
            setState(prev => ({ ...prev, isNative: true }));
        }
    }, []);

    // Check current permission status
    const checkPermissions = useCallback(async () => {
        if (!Capacitor.isNativePlatform()) return;

        try {
            const status = await PushNotifications.checkPermissions();
            setState(prev => ({ ...prev, permission: status.receive }));
            return status;
        } catch (error) {
            console.error('Error checking push permissions:', error);
            setState(prev => ({ ...prev, error }));
        }
    }, []);

    // Request permissions and register if granted
    const requestPermissions = useCallback(async () => {
        if (!Capacitor.isNativePlatform()) return;

        try {
            let status = await PushNotifications.checkPermissions();

            if (status.receive === 'prompt') {
                status = await PushNotifications.requestPermissions();
            }

            setState(prev => ({ ...prev, permission: status.receive }));

            if (status.receive === 'granted') {
                await PushNotifications.register();
            }
        } catch (error) {
            console.error('Error requesting push permissions:', error);
            setState(prev => ({ ...prev, error }));
        }
    }, []);

    // Register listeners for token and notifications
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        // Listener for registration success (Token received)
        const registrationListener = PushNotifications.addListener('registration', async (token) => {
            console.log('Push Registration Token:', token.value);
            setState(prev => ({ ...prev, token: token.value }));

<<<<<<< HEAD
            // Save token to Supabase
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { error } = await supabase
                        .from('user_devices')
                        .upsert(
                            {
                                user_id: user.id,
                                fcm_token: token.value,
                                platform: Capacitor.getPlatform(),
                                last_active: new Date().toISOString()
                            },
                            { onConflict: 'user_id, fcm_token' }
                        );

                    if (error) {
                        console.error('Error saving FCM token:', error);
                    }
                }
            } catch (err) {
                console.error('Unexpected error saving FCM token:', err);
            }
=======
            // Here you would typically send the token to your backend
            // const supabase = createClient();
            // await supabase.from('user_devices').upsert({ ... });
>>>>>>> pr-286
        });

        // Listener for registration error
        const registrationErrorListener = PushNotifications.addListener('registrationError', (error) => {
            console.error('Push Registration Error:', error);
            setState(prev => ({ ...prev, error }));
        });

        // Listener for incoming notifications
        const notificationListener = PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push Notification Received:', notification);
            // You can add logic here to show a local toast/banner if app is open
        });

        // Listener for notification actions (tapping the notification)
        const actionListener = PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('Push Notification Action Performed:', notification.actionId, notification.inputValue);
        });

        return () => {
            registrationListener.then(listener => listener.remove());
            registrationErrorListener.then(listener => listener.remove());
            notificationListener.then(listener => listener.remove());
            actionListener.then(listener => listener.remove());
        };
    }, []);

    // Initial check on mount
    useEffect(() => {
        checkPermissions();
    }, [checkPermissions]);

    return {
        ...state,
        checkPermissions,
        requestPermissions
    };
};
