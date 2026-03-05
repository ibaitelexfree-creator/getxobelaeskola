'use client';

import RealEstateView from '@/components/RealEstateView';
import BottomNav from '@/components/BottomNav';

export default function RealEstateRoute() {
    return (
        <main className="min-h-screen">
            {/* Header */}
            <header className="px-5 pt-4 pb-2 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-display text-glimmer tracking-tight">Mission Control</h1>
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] active:text-status-blue transition-colors">Real Estate Relay</p>
                </div>
            </header>

            <div className="px-4 pb-safe mt-6">
                <RealEstateView />
            </div>

            <BottomNav />
        </main>
    );
}
