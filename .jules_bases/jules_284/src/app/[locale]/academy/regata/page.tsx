import React from 'react';
import { RegattaGame } from '@/components/academy/regatta/RegattaGame';

export const metadata = {
    title: 'Regata Virtual | Getxo Sailing School',
    description: 'Compite en tiempo real contra otros alumnos.',
};

export default function RegattaPage() {
    return (
        <main className="w-full h-screen bg-black overflow-hidden">
            <RegattaGame />
        </main>
    );
}
