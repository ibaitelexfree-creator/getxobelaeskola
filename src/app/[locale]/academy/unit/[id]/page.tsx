import React from 'react';
import UnitReaderMain from './UnitReaderMain';

export async function generateMetadata({ params }: { params: { locale: string; id: string } }) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://getxobelaeskola.cloud' : 'http://localhost:3000')}/api/academy/unit/${params.id}`);
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



import { requireAuth } from '@/lib/auth-guard';
import { verifyUnitAccess } from '@/lib/academy/enrollment';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function UnitReaderPage({ params }: { params: { locale: string; id: string } }) {
    // 1. Auth Check
    const { user, error } = await requireAuth();
    if (error || !user) redirect(`/${params.locale}/auth/login`);

    // 2. Existence Check (404)
    const supabase = createClient();
    const { data: unitData } = await supabase.from('unidades_didacticas').select('id').eq('id', params.id).single();

    if (!unitData) {
        notFound();
    }

    // 3. Access Check (Redirect)
    const hasAccess = await verifyUnitAccess(user.id, params.id);

    if (!hasAccess) {
        redirect(`/${params.locale}/academy`);
    }

    // 4. Render content
    return <UnitReaderMain params={params} />;
}
