'use client';

import React, { Suspense } from 'react';
import Logbook from '@/components/academy/logbook/Logbook';

export default function LogbookPage() {
    return (
        <div className="w-full min-h-screen bg-nautical-black flex flex-col pt-16 relative overflow-x-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(14,165,233,0.05),transparent)] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(14,165,233,0.05),transparent)] pointer-events-none" />

            <div className="w-full flex-grow relative z-10 px-4">
                <Logbook />
            </div>

            {/* Aesthetic Borders */}
            <div className="fixed top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
            <div className="fixed top-0 bottom-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        </div>
    );
}
