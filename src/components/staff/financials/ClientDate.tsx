'use client';

import React, { useState, useEffect } from 'react';

// Fixed Date formatter to prevent hydration mismatch (Forced to Getxo Time)
export const ClientDate = ({ date }: { date: string | Date | null | undefined }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted || !date) return <span className="opacity-0">--/--/---- --:--:--</span>;
    try {
        const d = new Date(date);
        const options: Intl.DateTimeFormatOptions = { timeZone: 'Europe/Madrid' };
        return (
            <span suppressHydrationWarning className="flex flex-col">
                <span className="text-white/80">{d.toLocaleDateString('es-ES', options)}</span>
                <span className="text-3xs text-accent/60">{d.toLocaleTimeString('es-ES', { ...options, hour: '2-digit', minute: '2-digit', hour12: false })}</span>
            </span>
        );
    } catch { return <span className="opacity-20">--/--/---- --:--:--</span>; }
};
