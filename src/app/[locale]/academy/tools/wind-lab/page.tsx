import dynamic from 'next/dynamic';
import React from 'react';

const WindTunnel = dynamic(
    () => import('@/components/academy/simulation/wind-tunnel/WindTunnel'),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
        )
    }
);

export default function WindLabPage() {
    return (
        <main className="w-full h-screen bg-slate-900">
            <WindTunnel />
        </main>
    );
}
