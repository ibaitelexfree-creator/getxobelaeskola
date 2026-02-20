import React from 'react';
import LevelDetailMain from './LevelDetailMain';

export async function generateStaticParams() {
    const slugs = ['licencia-navegacion', 'iniciacion-j80', 'perfeccionamiento-vela'];
    const locales = ['es', 'eu', 'en', 'fr'];

    return locales.flatMap(locale =>
        slugs.map(slug => ({ locale, slug }))
    );
}

import { apiUrl } from '@/lib/api';


const LEVEL_TITLES: Record<string, { es: string, eu: string }> = {
    'licencia-navegacion': { es: 'Licencia de Navegación', eu: 'Nabigazio Lizentzia' },
    'iniciacion-j80': { es: 'Iniciación J80', eu: 'J80 Hastapena' },
    'perfeccionamiento-vela': { es: 'Perfeccionamiento Vela', eu: 'Bela Hobetzea' }
};

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }) {
    const titles = LEVEL_TITLES[params.slug] || { es: 'Nivel de Formación', eu: 'Prestakuntza Maila' };
    const title = params.locale === 'eu' ? titles.eu : titles.es;

    return {
        title: `${title} | Getxo Bela Eskola`,
        description: 'Tu viaje de formación náutica en Getxo.'
    };
}

export default function LevelDetailPage({ params }: { params: { locale: string; slug: string } }) {
    return <LevelDetailMain params={params} />;
}
