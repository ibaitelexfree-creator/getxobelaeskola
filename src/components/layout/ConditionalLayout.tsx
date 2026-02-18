'use client';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import AcademyControls from '@/components/layout/AcademyControls';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import NotificationContainer from '@/components/academy/notifications/NotificationContainer';
import RealtimeNotifications from '@/components/academy/notifications/RealtimeNotifications';
import ActivityTracker from '@/components/academy/ActivityTracker';

interface ConditionalLayoutProps {
    children: ReactNode;
    navbar: ReactNode;
    footer: ReactNode;
    locale: string;
}

export default function ConditionalLayout({ children, navbar, footer }: ConditionalLayoutProps) {
    const pathname = usePathname();
    const isAcademy = pathname.includes('/academy');
    const isAuth = pathname.includes('/auth/');

    // Academy mode — no nav, show academy controls
    if (isAcademy) {
        return (
            <>
                <main className="flex-grow flex flex-col relative w-full h-full min-h-screen bg-nautical-black">
                    {children}
                    <AcademyControls />
                </main>
                {!isAuth && (
                    <div className="md:hidden">
                        <MobileBottomNav />
                    </div>
                )}
                <NotificationContainer />
                <RealtimeNotifications />
                <ActivityTracker />
            </>
        );
    }

    return (
        <>
            {/* Desktop Navbar - hidden on mobile */}
            {!isAuth && <div className="hidden md:block">{navbar}</div>}

            <main className={`flex-grow min-h-screen bg-nautical-black ${!isAuth ? 'pb-24 md:pb-0' : ''}`}>
                {children}
            </main>

            {/* Desktop Footer - hidden on mobile */}
            {!isAuth && <div className="hidden md:block">{footer}</div>}

            {/* Mobile Navigation - hidden on desktop */}
            {!isAuth && (
                <div className="md:hidden">
                    <MobileBottomNav />
                </div>
            )}

            {!isAuth && (
                <>
                    <NotificationContainer />
                    <RealtimeNotifications />
                    <ActivityTracker />
                </>
            )}
        </>
    );
}
