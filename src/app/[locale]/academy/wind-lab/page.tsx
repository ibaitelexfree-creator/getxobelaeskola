import { WindLabContainer } from '@/components/academy/wind-lab/WindLabContainer';
import React from 'react';

export const metadata = {
    title: 'Wind Lab | Getxo Sailing School',
    description: 'Advanced wind physics simulation and trimming laboratory.',
};

export default function WindLabPage() {
    return (
        <main className="w-full min-h-screen bg-slate-950">
            <WindLabContainer />
        </main>
    );
}
