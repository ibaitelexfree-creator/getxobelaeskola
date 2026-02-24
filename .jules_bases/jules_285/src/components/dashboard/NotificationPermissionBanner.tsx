'use client';

import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

export default function NotificationPermissionBanner() {
    const t = useTranslations('notifications');
    const { requestPermissions, checkPermissions } = usePushNotifications();
    const [isVisible, setIsVisible] = useState(false);
    const [isNative, setIsNative] = useState(false);

    useEffect(() => {
        // SSR safe import
        import('@capacitor/core').then(({ Capacitor }) => {
            if (Capacitor.isNativePlatform()) {
                setIsNative(true);
                // Show banner if permission is NOT granted (denied or prompt)
                checkPermissions().then((status) => {
                    if (status && status.receive !== 'granted') {
                        setIsVisible(true);
                    }
                });
            }
        });
    }, [checkPermissions]);

    if (!isVisible || !isNative) return null;

    const handleEnable = async () => {
        await requestPermissions();
        // After request, check again
        const status = await checkPermissions();
        if (status && status.receive === 'granted') {
            setIsVisible(false);
        }
    };

    return (
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="p-2 bg-accent/20 rounded-full shrink-0">
                <Bell className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
                <h4 className="font-display font-bold text-accent mb-1">
                    {t('enable_notifications_title')}
                </h4>
                <p className="text-sm text-foreground/80 mb-3">
                    {t('enable_notifications_desc')}
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={handleEnable}
                        className="text-xs font-bold bg-accent text-accent-foreground px-4 py-2 rounded-sm hover:bg-accent/90 transition-colors uppercase tracking-widest"
                    >
                        {t('enable_btn')}
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-xs font-bold text-foreground/60 hover:text-foreground px-2 py-2 uppercase tracking-widest transition-colors"
                    >
                        {t('later_btn')}
                    </button>
                </div>
            </div>
            <button
                onClick={() => setIsVisible(false)}
                className="text-foreground/40 hover:text-foreground transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
