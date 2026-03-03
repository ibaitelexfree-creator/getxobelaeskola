'use client';

import React from 'react';

export default function SessionsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-white/5 rounded-sm" />
                    <div className="h-4 w-48 bg-white/5 rounded-sm" />
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="h-10 w-32 bg-white/5 rounded-sm" />
                    <div className="h-10 w-40 bg-white/5 rounded-sm" />
                </div>
            </header>

            {/* Table Skeleton */}
            <div className="border border-white/5 rounded-sm overflow-hidden bg-nautical-black/20">
                <div className="h-12 bg-white/5 border-b border-white/10" />
                <div className="divide-y divide-white/5">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="p-4 flex items-center justify-between gap-4">
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-24 bg-white/5 rounded-sm" />
                                <div className="h-3 w-16 bg-white/5 rounded-sm" />
                            </div>
                            <div className="flex-[2] h-4 w-full bg-white/5 rounded-sm" />
                            <div className="flex-1 h-4 w-32 bg-white/5 rounded-sm" />
                            <div className="flex-1 h-6 w-20 bg-white/5 rounded-sm" />
                            <div className="flex-1 flex justify-end gap-2">
                                <div className="h-8 w-16 bg-white/5 rounded-sm" />
                                <div className="h-8 w-12 bg-white/5 rounded-sm" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
