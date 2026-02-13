import React from 'react';
import LevelDetailMain from './LevelDetailMain';

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }) {
    try {
        const resNiveles = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/academy/levels`);
        const dataNiveles = await resNiveles.json();
        const nivel = dataNiveles.niveles?.find((n: any) => n.slug === params.slug);

        if (!nivel) return { title: 'Nivel no encontrado' };

        return {
            title: `${params.locale === 'eu' ? nivel.nombre_eu : nivel.nombre_es} | Getxo Bela Eskola`,
            description: params.locale === 'eu' ? nivel.descripcion_eu : nivel.descripcion_es,
        };
    } catch { return { title: 'Getxo Bela Eskola Academy' }; }
}

export default function LevelDetailPage({ params }: { params: { locale: string; slug: string } }) {
    return <LevelDetailMain params={params} />;
}
