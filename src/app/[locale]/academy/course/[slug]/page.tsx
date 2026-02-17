import React from 'react';
import CourseDetailMain from './CourseDetailMain';

import { apiUrl } from '@/lib/api';

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }) {
    try {
        const res = await fetch(apiUrl(`/api/academy/course/${params.slug}`));
        const data = await res.json();

        if (data.error || !data.curso) {
            return {
                title: params.locale === 'eu' ? 'Ikastaroa ez da aurkitu' : 'Curso no encontrado',
            };
        }

        const title = params.locale === 'eu' ? data.curso.nombre_eu : data.curso.nombre_es;
        const description = params.locale === 'eu' ? data.curso.descripcion_eu : data.curso.descripcion_es;

        return {
            title: `${title} | Getxo Bela Eskola`,
            description: description,
            openGraph: {
                title: title,
                description: description,
            },
        };
    } catch (error) {
        return {
            title: 'Getxo Bela Eskola Academy',
        };
    }
}


export async function generateStaticParams() {
    const slugs = ['iniciacion-j80', 'perfeccionamiento-vela', 'licencia-navegacion', 'vela-ligera'];
    const locales = ['es', 'eu', 'en', 'fr'];
    return locales.flatMap(locale => slugs.map(slug => ({ locale, slug })));
}

export default async function CourseDetailPage({ params }: { params: { locale: string; slug: string } }) {
    // Note: We remove server-side redirects here because they require a server (cookies).
    // The Client Component (CourseDetailMain) will handle fetching and auth via API.
    return <CourseDetailMain params={params} />;
}
