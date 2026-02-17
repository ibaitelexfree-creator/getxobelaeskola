'use client';

import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';
import AcademyControls from '@/components/layout/AcademyControls';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

interface ConditionalLayoutProps {
    children: ReactNode;
    navbar: ReactNode;
    footer: ReactNode;
}

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => {
            // Capacitor native OR narrow viewport
            const isCapacitor = typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();
            const isNarrow = window.innerWidth < 768;
            setIsMobile(isCapacitor || isNarrow);
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    return isMobile;
}

export default function ConditionalLayout({ children, navbar, footer }: ConditionalLayoutProps) {
    const pathname = usePathname();
    const isMobile = useIsMobile();
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
                {isMobile && !isAuth && <MobileBottomNav />}
            </>
        );
    }

    // Mobile layout — no navbar/footer, bottom tab nav
    if (isMobile) {
        return (
            <>
                <main className="flex-grow pb-20 min-h-screen bg-nautical-black">
                    {children}
                </main>
                {!isAuth && <MobileBottomNav />}
            </>
        );
    }

    // Desktop layout — full navbar & footer
    return (
        <>
            {navbar}
            <main className="flex-grow">
                {children}
            </main>
            {footer}
        </>
    );
}
