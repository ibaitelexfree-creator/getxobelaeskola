import React from 'react';
import UnitReaderMain from './UnitReaderMain';

import { apiUrl } from '@/lib/api';

export async function generateMetadata({ params }: { params: { locale: string; id: string } }) {
    try {
        const res = await fetch(apiUrl(`/api/academy/unit/${params.id}`));
        const data = await res.json();

        if (data.error || !data.unidad) {
            return {
                title: params.locale === 'eu' ? 'Unitatea ez da aurkitu' : 'Unidad no encontrada',
            };
        }

        const title = params.locale === 'eu' ? data.unidad.nombre_eu : data.unidad.nombre_es;
        const objectives = params.locale === 'eu' ? data.unidad.objetivos_eu : data.unidad.objetivos_es;
        const description = objectives && objectives.length > 0 ? objectives[0] : (params.locale === 'eu' ? 'Ikasi nabigazioa urratsez urrats.' : 'Aprende navegación paso a paso.');

        return {
            title: `${title} | Getxo Bela Eskola`,
            description: description,
        };
    } catch (error) {
        return {
            title: 'Getxo Bela Eskola Academy',
        };
    }
}

export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale, id: 'unit-intro' }));
}

import { requireAuth } from '@/lib/auth-guard';
import { verifyUnitAccess } from '@/lib/academy/enrollment';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default function UnitReaderPage({ params }: { params: { locale: string; id: string } }) {
    return <UnitReaderMain params={params} />;
}
