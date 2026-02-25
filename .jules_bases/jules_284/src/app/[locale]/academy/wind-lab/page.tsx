'use client';

import { WindLabContainer } from '@/components/academy/wind-lab/WindLabContainer';
import React, { useEffect, useState } from 'react';

export default function WindLabPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-full h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="w-full min-h-screen bg-slate-950 overflow-hidden">
            <WindLabContainer />
        </main>
    );
}
