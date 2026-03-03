import React from 'react';

export default function AcademySkeleton() {
    return (
        <div className="min-h-screen bg-premium-mesh text-white pb-32 animate-fade-in" role="status" aria-live="polite">
            <header className="pt-24 pb-16">
                <div className="container mx-auto px-6">
                    <div className="h-4 w-32 bg-white/5 rounded-full mb-6 animate-pulse" />
                    <div className="h-16 md:h-24 w-full max-w-2xl bg-white/5 rounded mb-8 animate-pulse" />
                    <div className="h-4 w-full max-w-md bg-white/5 rounded animate-pulse" />
                </div>
            </header>

            <main className="container mx-auto px-6 py-24">
                <div className="max-w-6xl mx-auto space-y-12">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-12 glass-card animate-pulse">
                            <div className="flex flex-col lg:flex-row gap-10">
                                <div className="w-32 h-32 rounded-full bg-white/10" />
                                <div className="flex-1 space-y-4">
                                    <div className="h-10 w-3/4 bg-white/10 rounded" />
                                    <div className="h-4 w-full bg-white/10 rounded" />
                                    <div className="h-4 w-1/2 bg-white/10 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
