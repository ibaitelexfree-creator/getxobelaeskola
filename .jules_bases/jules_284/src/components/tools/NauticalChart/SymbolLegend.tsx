'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Info, X, Anchor } from 'lucide-react';

export default function SymbolLegend() {
    const t = useTranslations('nautical_chart.legend');
    const [isOpen, setIsOpen] = useState(false);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="absolute top-4 right-4 z-[1000] bg-white/95 p-3 rounded-xl shadow-lg border border-slate-200/60 backdrop-blur-md text-nautical-blue hover:scale-105 transition-transform group"
                title={t('title')}
            >
                <Info size={24} className="group-hover:text-accent transition-colors" />
            </button>
        );
    }

    return (
        <div className="absolute top-4 right-4 z-[1000] bg-white/95 w-64 p-5 rounded-xl shadow-2xl border border-slate-200/60 backdrop-blur-md animate-in slide-in-from-right-5 fade-in duration-300">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
                <span className="font-black text-[10px] uppercase tracking-[0.2em] text-nautical-blue flex items-center gap-2">
                    <Info size={14} />
                    {t('title')}
                </span>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {/* Lighthouse */}
                <div className="flex items-center gap-4 group hover:bg-slate-50 p-1.5 rounded-lg transition-colors -mx-1.5">
                    <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-slate-100 shadow-sm group-hover:border-purple-200 transition-colors">
                         <span className="text-purple-600 font-bold text-xl drop-shadow-sm">★</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">{t('lighthouse')}</span>
                </div>

                {/* Buoy */}
                <div className="flex items-center gap-4 group hover:bg-slate-50 p-1.5 rounded-lg transition-colors -mx-1.5">
                    <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-slate-100 shadow-sm group-hover:border-red-200 transition-colors gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full border border-white shadow-sm ring-1 ring-black/5"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full border border-white shadow-sm ring-1 ring-black/5"></div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">{t('buoy')}</span>
                </div>

                {/* Wreck */}
                <div className="flex items-center gap-4 group hover:bg-slate-50 p-1.5 rounded-lg transition-colors -mx-1.5">
                    <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-slate-100 shadow-sm group-hover:border-slate-300 transition-colors">
                        <span className="text-slate-800 font-serif font-black italic text-sm">Wk</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">{t('wreck')}</span>
                </div>

                {/* Harbor */}
                <div className="flex items-center gap-4 group hover:bg-slate-50 p-1.5 rounded-lg transition-colors -mx-1.5">
                    <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-slate-100 shadow-sm group-hover:border-nautical-blue/30 transition-colors">
                        <Anchor size={18} className="text-nautical-blue" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">{t('harbor')}</span>
                </div>

                {/* Depth */}
                <div className="flex items-center gap-4 group hover:bg-slate-50 p-1.5 rounded-lg transition-colors -mx-1.5">
                    <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-slate-100 shadow-sm group-hover:border-blue-200 transition-colors">
                        <span className="font-mono text-sm text-slate-500 italic">12<span className="text-[9px] align-top">5</span></span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">{t('depth')}</span>
                </div>
            </div>
        </div>
    );
}
