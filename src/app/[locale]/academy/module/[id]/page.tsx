import React from 'react';
import ModuleDetailMain from './ModuleDetailMain';

import { apiUrl } from '@/lib/api';

export async function generateMetadata({ params }: { params: { locale: string; id: string } }) {
    try {
        const res = await fetch(apiUrl(`/api/academy/module/${params.id}`));
        const data = await res.json();

        if (data.error || !data.modulo) return { title: 'Módulo no encontrado' };

        return {
            title: `${params.locale === 'eu' ? data.modulo.nombre_eu : data.modulo.nombre_es} | Getxo Bela Eskola`,
            description: params.locale === 'eu' ? data.modulo.descripcion_eu : data.modulo.descripcion_es,
        };
    } catch { return { title: 'Getxo Bela Eskola Academy' }; }
}



export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale, id: 'placeholder' }));
}

export default function ModuleDetailPage({ params }: { params: { locale: string; id: string } }) {
    // Note: Auth and existence checks are moved to the Client Component (ModuleDetailMain)
    // to allow for output: export.
    return <ModuleDetailMain params={params} />;
}
