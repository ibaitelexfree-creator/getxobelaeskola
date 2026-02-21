import { useEffect, useState, useCallback } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { registerDevice } from '@/lib/api';

export interface PushNotificationState {
    permission: PermissionState | 'prompt' | 'prompt-with-rationale';
    token?: string;
    error?: any;
    isNative: boolean;
}

export const usePushNotifications = () => {
    const [state, setState] = useState<PushNotificationState>({
        permission: 'prompt',
        isNative: false,
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
            setState(prev => ({ ...prev, isNative: true }));
        }
    }, []);

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

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        // Listener for registration success (Token received)
        const registrationListener = PushNotifications.addListener('registration', async (token) => {
            console.log('Push Registration Token:', token.value);
            setState(prev => ({ ...prev, token: token.value }));

            try {
                const info = await Device.getInfo();
                const id = await Device.getId();

                // Register with our Maestro server
                await registerDevice(token.value, info.platform, id.identifier);
                console.log('[Push] Device registered successfully with Maestro server');
            } catch (err) {
                console.error('[Push] Failed to register device with server:', err);
            }
        });

        const registrationErrorListener = PushNotifications.addListener('registrationError', (error) => {
            console.error('Push Registration Error:', error);
            setState(prev => ({ ...prev, error }));
        });

        const notificationListener = PushNotifications.addListener('pushNotificationReceived', async (notification) => {
            console.log('Push Notification Received:', notification);

            // Haptic Feedback for Maestro v3 Events
            await Haptics.impact({ style: ImpactStyle.Medium });

            // If it's a priority event, double impact
            if (notification.data?.priority === 'high') {
                setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }), 200);
            }
            // Logic for Maestro events can go here (e.g., refresh store if taskId complete)
        });

        const actionListener = PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('Push Action:', notification.actionId);
        });

        return () => {
            registrationListener.then(l => l.remove());
            registrationErrorListener.then(l => l.remove());
            notificationListener.then(l => l.remove());
            actionListener.then(l => l.remove());
        };
    }, []);

    useEffect(() => {
        checkPermissions();
    }, [checkPermissions]);

    return {
        ...state,
        checkPermissions,
        requestPermissions
    };
};
