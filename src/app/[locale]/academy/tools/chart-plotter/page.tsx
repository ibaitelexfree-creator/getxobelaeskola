'use client';

import ChartCanvas from '@/components/academy/tools/ChartPlotter/ChartCanvas';
import { useTranslations } from 'next-intl';

export default function ChartPlotterPage() {
    const t = useTranslations('academy');

    return (
        <div className="w-full h-screen bg-[#e0e0e0] flex flex-col relative overflow-hidden">
            <ChartCanvas />

            {/* Header Overlay */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-6 py-2 rounded-full border border-black/10 shadow-xl pointer-events-none">
                <h1 className="text-sm font-display italic text-nautical-black">Mesa de Cartas Virtual</h1>
            </div>
        </div>
    );
}
