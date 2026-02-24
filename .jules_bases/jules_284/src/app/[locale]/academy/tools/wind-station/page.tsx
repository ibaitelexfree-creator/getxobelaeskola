import React from 'react';
import WindStation from '@/components/academy/tools/wind-station/WindStation';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    return {
        title: 'Estación Meteorológica IoT - Club Náutico Getxo',
        description: 'Datos de viento en tiempo real del sensor IoT del puerto.'
    };
}

export default function WindStationPage() {
    return (
        <div className="min-h-screen bg-nautical-black text-white p-6 md:p-12">
            <WindStation />
        </div>
    );
}
