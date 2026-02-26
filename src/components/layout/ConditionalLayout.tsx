'use client';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
<<<<<<< HEAD
=======
// Capacitor will be dynamically checked in the effect to avoid SSR issues
// import { Capacitor } from '@capacitor/core';
>>>>>>> pr-286

import AcademyControls from '@/components/layout/AcademyControls';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import NotificationContainer from '@/components/academy/notifications/NotificationContainer';
import RealtimeNotifications from '@/components/academy/notifications/RealtimeNotifications';
<<<<<<< HEAD
import SmartNotificationManager from '@/components/academy/notifications/SmartNotificationManager';
=======
>>>>>>> pr-286
import SafetyMonitor from '@/components/academy/notifications/SafetyMonitor';
import ActivityTracker from '@/components/academy/ActivityTracker';

interface ConditionalLayoutProps {
    children: ReactNode;
    navbar: ReactNode;
    footer: ReactNode;
<<<<<<< HEAD
=======
    locale: string;
>>>>>>> pr-286
}

export default function ConditionalLayout({ children, navbar, footer }: ConditionalLayoutProps) {
    const pathname = usePathname();
    const isAcademy = pathname.includes('/academy');
    const isAuth = pathname.includes('/auth/');

    // Default to false (SSR/Web)
    const [isNativeApp, setIsNativeApp] = useState(false);

    useEffect(() => {
        // Check if running in a native Capacitor environment (iOS/Android)
        import('@capacitor/core').then(({ Capacitor }) => {
            if (Capacitor.isNativePlatform()) {
                setIsNativeApp(true);
            }
        });
    }, []);

    // Academy mode — no nav, show academy controls
    if (isAcademy) {
        return (
            <>
                <main className="flex-grow flex flex-col relative w-full h-full min-h-screen bg-nautical-black">
                    {children}
                    <AcademyControls />
                </main>
                {!isAuth && isNativeApp && (
                    <div className="block">
                        <MobileBottomNav />
                    </div>
                )}
                <NotificationContainer />
                <RealtimeNotifications />
<<<<<<< HEAD
                <SmartNotificationManager />
=======
>>>>>>> pr-286
                <SafetyMonitor />
                <ActivityTracker />
            </>
        );
    }

    return (
        <>
            {/* Navbar: Visible on Web (Responsive), Hidden on Native App */}
            {!isAuth && !isNativeApp && (
                <div className="block">{navbar}</div>
            )}

            <main className={`flex-grow min-h-screen bg-nautical-black ${!isAuth ? 'pb-24 md:pb-0' : ''}`}>
                {children}
            </main>

            {/* Footer: Visible on Web (Responsive), Hidden on Native App */}
            {!isAuth && !isNativeApp && (
                <div className="block">{footer}</div>
            )}

            {/* Mobile Navigation: Visible ONLY on Native Mobile App */}
            {!isAuth && isNativeApp && (
                <div className="block">
                    <MobileBottomNav />
                </div>
            )}

            {!isAuth && (
                <>
                    <NotificationContainer />
                    <RealtimeNotifications />
<<<<<<< HEAD
                    <SmartNotificationManager />
=======
>>>>>>> pr-286
                    <SafetyMonitor />
                    <ActivityTracker />
                </>
            )}
        </>
    );
}
