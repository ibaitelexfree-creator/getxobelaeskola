'use client';

import { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Capacitor } from '@capacitor/core';

export default function PushNotificationInitializer() {
    const { requestPermissions, checkPermissions } = usePushNotifications();

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const init = async () => {
            const status = await checkPermissions();

            // If we haven't asked yet (prompt), ask now.
            // If already granted, ensure we are registered (requestPermissions handles this internally).
            if (status && (status.receive === 'prompt' || status.receive === 'granted')) {
                await requestPermissions();
            }
        };

        init();

    }, [checkPermissions, requestPermissions]);

    return null; // This component renders nothing
}
