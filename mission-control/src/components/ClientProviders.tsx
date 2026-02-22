'use client';

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { FirebaseCrashlytics } from '@capacitor-community/firebase-crashlytics';
import { Capacitor } from '@capacitor/core';
import '@/lib/i18n';

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

        // Initialize Crashlytics
        if (Capacitor.isNativePlatform()) {
            FirebaseCrashlytics.setEnabled({ enabled: true })
                .then(() => FirebaseCrashlytics.addLogMessage({ message: "App started - Mission Control Center" }))
                .catch(err => console.error("Crashlytics init error:", err));
        }

        return () => {
            backListener.then(l => l.remove());
        };
    }, [requestPermissions]);

    return <>{children}</>;
}
