import React from 'react';
import ModuleDetailMain from './ModuleDetailMain';

export async function generateMetadata({ params }: { params: { locale: string; id: string } }) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://getxobelaeskola.cloud' : 'http://localhost:3000')}/api/academy/module/${params.id}`);
        const data = await res.json();

        if (data.error || !data.modulo) return { title: 'Módulo no encontrado' };

        return {
            title: `${params.locale === 'eu' ? data.modulo.nombre_eu : data.modulo.nombre_es} | Getxo Bela Eskola`,
            description: params.locale === 'eu' ? data.modulo.descripcion_eu : data.modulo.descripcion_es,
        };
    } catch { return { title: 'Getxo Bela Eskola Academy' }; }
}



import { requireAuth } from '@/lib/auth-guard';
import { verifyModuleAccess } from '@/lib/academy/enrollment';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function ModuleDetailPage({ params }: { params: { locale: string; id: string } }) {
    // 1. Auth Check
    const { user, error } = await requireAuth();
    if (error || !user) redirect(`/${params.locale}/auth/login`);

    // 2. Existence Check (404)
    // We check this separately because verifyModuleAccess returns false for both "missing" and "denied"
    const supabase = createClient();
    const { data: moduleData } = await supabase.from('modulos').select('id').eq('id', params.id).single();

    if (!moduleData) {
        notFound();
    }

    // 3. Access Check (Redirect)
    const hasAccess = await verifyModuleAccess(user.id, params.id);

    if (!hasAccess) {
        // Redirect back to Academy dashboard if trying to access locked content
        redirect(`/${params.locale}/academy`);
    }

    return <ModuleDetailMain params={params} />;
}
