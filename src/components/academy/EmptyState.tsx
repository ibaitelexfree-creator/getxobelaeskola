'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: string;
    imageUrl?: string;
    actionLabel?: string;
    actionHref?: string;
}

export default function EmptyState({
    title,
    description,
    icon,
    imageUrl,
    actionLabel,
    actionHref
}: EmptyStateProps) {
    return (
        <div className="group bg-card/50 border border-card-border p-12 text-center rounded-xl relative overflow-hidden backdrop-blur-sm col-span-full">
            {/* Background elements */}
            <div className="absolute inset-0 bg-mesh opacity-[0.03]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-accent/5 rounded-full blur-[60px] pointer-events-none" />

            <div className="relative z-10 space-y-6">
                {imageUrl ? (
                    <div className="relative w-32 h-32 mx-auto filter grayscale group-hover:grayscale-0 transition-all duration-700 opacity-40 group-hover:opacity-100">
                        <Image
                            src={imageUrl}
                            alt={title}
                            fill
                            className="object-contain"
                        />
                    </div>
                ) : (
                    <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-4xl mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-700">
                        {icon || '⚓'}
                    </div>
                )}

                <div className="space-y-2">
                    <h3 className="text-2xl font-display text-white italic">
                        {title}
                    </h3>
                    <p className="text-foreground/40 font-light text-sm max-w-sm mx-auto">
                        {description}
                    </p>
                </div>

                {actionLabel && actionHref && (
                    <div className="pt-4">
                        <Link
                            href={actionHref}
                            className="inline-flex items-center px-8 py-3 bg-accent text-nautical-black font-bold uppercase tracking-widest text-[10px] hover:bg-white transition-all shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]"
                        >
                            {actionLabel}
                            <span className="ml-3 group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
