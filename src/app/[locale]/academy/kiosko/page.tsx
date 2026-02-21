'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import KioskVideo from './components/KioskVideo';
import KioskNomenclature from './components/KioskNomenclature';
import KioskStats from './components/KioskStats';

// Dynamically import map to avoid SSR issues with Leaflet
const KioskMap = dynamic(() => import('./components/KioskMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-nautical-black animate-pulse" />
});

type ViewMode = 'VIDEO' | 'NOMENCLATURE' | 'MAP' | 'STATS';

const VIEW_SEQUENCE: ViewMode[] = ['VIDEO', 'NOMENCLATURE', 'MAP', 'STATS'];
const VIEW_DURATION = 30000; // 30 seconds

export default function KioskPage({ params: { locale } }: { params: { locale: string } }) {
    const [currentViewIndex, setCurrentViewIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentViewIndex((prev) => (prev + 1) % VIEW_SEQUENCE.length);
        }, VIEW_DURATION);

        return () => clearInterval(interval);
    }, []);

    const currentView = VIEW_SEQUENCE[currentViewIndex];

    const renderView = () => {
        switch (currentView) {
            case 'VIDEO':
                return <KioskVideo />;
            case 'NOMENCLATURE':
                return <KioskNomenclature locale={locale} />;
            case 'MAP':
                return <KioskMap />;
            case 'STATS':
                return <KioskStats />;
            default:
                return null;
        }
    };

    return (
        <main className="w-screen h-screen overflow-hidden bg-black text-white relative">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentView}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="w-full h-full absolute inset-0"
                >
                    {renderView()}
                </motion.div>
            </AnimatePresence>

            {/* Progress Indicator */}
            <div className="absolute bottom-4 right-4 flex gap-2 z-50">
                {VIEW_SEQUENCE.map((view, idx) => (
                    <div
                        key={view}
                        className={`w-3 h-3 rounded-full transition-all duration-500 ${idx === currentViewIndex ? 'bg-accent scale-125' : 'bg-white/20'}`}
                    />
                ))}
            </div>

            {/* Title Overlay (Persistent but subtle) */}
            <div className="absolute top-4 left-4 z-50 pointer-events-none mix-blend-difference">
                 <div className="text-[10px] uppercase tracking-[0.5em] font-bold text-white/50">
                     Modo Kiosko · {locale.toUpperCase()}
                 </div>
            </div>
        </main>
    );
}
