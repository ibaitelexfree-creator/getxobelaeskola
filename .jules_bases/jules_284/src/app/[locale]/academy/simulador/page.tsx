import dynamic from 'next/dynamic';
import React from 'react';
import { SimulatorSkeleton } from '@/components/academy/sailing-simulator/SimulatorSkeleton';

const SailingSimulator = dynamic(
    () => import('@/components/academy/sailing-simulator').then(mod => mod.SailingSimulator),
    {
        ssr: false,
        loading: () => <SimulatorSkeleton />
    }
);

export const metadata = {
    title: 'Sailing Simulator | Getxo Sailing School',
    description: '3D interactive sailing simulation experience.',
};

export default function SimulatorPage() {
    return (
        <main className="w-full h-screen bg-black">
            <SailingSimulator />
        </main>
    );
}
