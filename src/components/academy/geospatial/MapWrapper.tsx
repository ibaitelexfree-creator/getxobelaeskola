'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const NauticalMap = dynamic(() => import('./NauticalMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[500px] bg-slate-800 animate-pulse rounded-3xl flex items-center justify-center">
            <span className="text-slate-400 font-bold tracking-widest">CARGANDO MAPA...</span>
        </div>
    )
});

export const MapWrapper = () => {
    return <NauticalMap />;
};
