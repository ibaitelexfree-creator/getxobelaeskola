'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import AcademyControls from '@/components/layout/AcademyControls';
interface ConditionalLayoutProps {
    children: ReactNode;
    navbar: ReactNode;
    footer: ReactNode;
}

export default function ConditionalLayout({ children, navbar, footer }: ConditionalLayoutProps) {
    const pathname = usePathname();
    const isAcademy = pathname.includes('/academy');

    if (isAcademy) {
        return (
            <>
                <main className="flex-grow flex flex-col relative w-full h-full min-h-screen bg-nautical-black">
                    {children}
                    <AcademyControls />
                </main>
            </>
        );
    }

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
