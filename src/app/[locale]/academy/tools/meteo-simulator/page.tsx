import React from 'react';
import { Metadata } from 'next';
import MeteoSimulator from '@/components/academy/tools/meteo-simulator/MeteoSimulator';

export const metadata: Metadata = {
    title: 'Simulador de Meteorología | Getxo Bela Eskola',
    description: 'Practica la toma de decisiones meteorológicas con partes reales.'
};

export default function MeteoSimulatorPage() {
    return (
        <MeteoSimulator />
    );
}
