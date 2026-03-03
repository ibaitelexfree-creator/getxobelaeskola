
import React from 'react';
import NomenclatureActivity from '@/components/academy/montessori/NomenclatureActivity';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Nomenclatura Náutica | Montessori Sailing',
    description: 'Aprende las partes del barco mediante el método de lección de tres tiempos.',
};

export default function NomenclaturePage() {
    return (
        <div className="min-h-screen bg-nautical-dark pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-display text-white mb-4">
                        Nomenclatura Náutica
                    </h1>
                    <p className="text-lg text-white/60 font-light max-w-2xl mx-auto">
                        Domina el vocabulario técnico esencial mediante el método Montessori de tarjetas de tres partes.
                    </p>
                </div>

                <NomenclatureActivity />
            </div>
        </div>
    );
}
