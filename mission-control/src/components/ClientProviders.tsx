'use client';

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function ClientProviders({ children }: { children: React.ReactNode }) {
    const { requestPermissions } = usePushNotifications();

    useEffect(() => {
        // Handle Android Back Button
        const backListener = App.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
                App.exitApp();
            } else {
                window.history.back();
            }
        });

        // Request Push Permissions on mount if in native
        requestPermissions();

        return () => {
            backListener.then(l => l.remove());
        };
    }, [requestPermissions]);

    return <>{children}</>;
}
