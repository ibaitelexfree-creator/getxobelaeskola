'use client';

import { useTranslations } from 'next-intl';
import { Compass, Ruler, Crosshair } from 'lucide-react';

interface InfoPanelProps {
    cursorPosition: [number, number] | null;
    routeDistance: number; // in nautical miles
    bearing: number | null; // in degrees
}

export default function InfoPanel({ cursorPosition, routeDistance, bearing }: InfoPanelProps) {
    const t = useTranslations('nautical_chart.info');

    // Format coordinates: 43°25.5'N 003°02.1'W
    const formatCoord = (lat: number, lng: number) => {
        const latDeg = Math.floor(Math.abs(lat));
        const latMin = ((Math.abs(lat) - latDeg) * 60).toFixed(1);
        const latDir = lat >= 0 ? 'N' : 'S';

        const lngDeg = Math.floor(Math.abs(lng));
        const lngMin = ((Math.abs(lng) - lngDeg) * 60).toFixed(1);
        const lngDir = lng >= 0 ? 'E' : 'W';

        return `${latDeg}°${latMin}'${latDir}  ${lngDeg.toString().padStart(3, '0')}°${lngMin}'${lngDir}`;
    };

    return (
        <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-3 bg-white/95 p-4 rounded-xl shadow-lg border border-slate-200/60 backdrop-blur-md min-w-[240px]">
            {/* Position */}
            <div className="flex items-center gap-3 text-slate-700 group">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                    <Crosshair size={18} className="text-slate-400 group-hover:text-nautical-blue transition-colors" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-[0.15em] font-black text-slate-400 mb-0.5">{t('position')}</span>
                    <span className="font-mono text-xs font-bold text-slate-700 tabular-nums tracking-tight">
                        {cursorPosition ? formatCoord(cursorPosition[0], cursorPosition[1]) : '--°--.--\'N  ---°--.--\'W'}
                    </span>
                </div>
            </div>

            <div className="h-px bg-slate-100 w-full" />

            {/* Distance */}
            <div className="flex items-center gap-3 text-slate-700 group">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                    <Ruler size={18} className="text-slate-400 group-hover:text-nautical-blue transition-colors" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-[0.15em] font-black text-slate-400 mb-0.5">{t('distance')}</span>
                    <span className="font-mono text-lg font-bold text-nautical-blue tabular-nums tracking-tight">
                        {routeDistance.toFixed(2)} <span className="text-[10px] text-slate-400 ml-0.5 font-sans font-bold">{t('nm')}</span>
                    </span>
                </div>
            </div>

            <div className="h-px bg-slate-100 w-full" />

            {/* Bearing */}
            <div className="flex items-center gap-3 text-slate-700 group">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                    <Compass size={18} className="text-slate-400 group-hover:text-nautical-blue transition-colors" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-[0.15em] font-black text-slate-400 mb-0.5">{t('bearing')}</span>
                    <span className="font-mono text-lg font-bold text-nautical-blue tabular-nums tracking-tight">
                        {bearing !== null ? Math.round(bearing).toString().padStart(3, '0') : '---'} <span className="text-[10px] text-slate-400 ml-0.5 font-sans font-bold">{t('degrees')}</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
