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
        <div className="p-12 rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center text-center col-span-full group hover:bg-white/[0.04] transition-colors">
            {imageUrl ? (
                <div className="relative w-40 h-40 mb-6 opacity-40 group-hover:opacity-60 transition-opacity">
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-contain"
                    />
                </div>
            ) : icon ? (
                <div className="text-6xl mb-6 opacity-40 group-hover:opacity-60 transition-opacity filter grayscale group-hover:grayscale-0">
                    {icon}
                </div>
            ) : null}

            <h3 className="text-xl font-display italic text-white mb-2">{title}</h3>
            <p className="text-white/40 text-sm max-w-xs mx-auto mb-6">
                {description}
            </p>

            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-2xs font-bold uppercase tracking-widest text-accent transition-colors"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}
