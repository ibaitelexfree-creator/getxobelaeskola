import React from 'react';

export default function UnitSkeleton() {
    return (
        <div className="min-h-screen bg-nautical-black text-white pb-32 animate-fade-in" role="status" aria-live="polite">
            {/* Header Skeleton */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-nautical-black/95 backdrop-blur-md border-b border-white/10 h-16" />

            <div className="pt-24 container mx-auto px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Title Section */}
                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-white/5 animate-pulse" />
                            <div className="flex-1 space-y-3">
                                <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
                                <div className="h-10 w-3/4 bg-white/5 rounded animate-pulse" />
                            </div>
                        </div>

                        {/* Objectives Box */}
                        <div className="bg-white/5 border border-white/10 rounded-sm p-6 space-y-3 animate-pulse">
                            <div className="h-3 w-24 bg-white/10 rounded" />
                            <div className="h-3 w-full bg-white/5 rounded" />
                            <div className="h-3 w-5/6 bg-white/5 rounded" />
                            <div className="h-3 w-4/6 bg-white/5 rounded" />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-8 flex gap-2">
                        <div className="h-10 w-24 bg-white/5 rounded-sm animate-pulse" />
                        <div className="h-10 w-24 bg-white/5 rounded-sm animate-pulse" />
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                        <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                        <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" />
                        <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                        <div className="h-32 w-full bg-white/5 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
