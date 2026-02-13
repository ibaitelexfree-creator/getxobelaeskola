import React from 'react';
import CourseDetailMain from './CourseDetailMain';

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/academy/course/${params.slug}`);
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


import { requireAuth } from '@/lib/auth-guard';
import { verifyCourseAccess } from '@/lib/academy/enrollment';
import { redirect } from 'next/navigation';

export default async function CourseDetailPage({ params }: { params: { locale: string; slug: string } }) {
    // 1. Auth Check (Redundant if layout covers it, but safe)
    const { user, error } = await requireAuth();
    if (error || !user) {
        redirect(`/${params.locale}/auth/login`);
    }

    // 2. Access Check (Enrollment)
    const hasAccess = await verifyCourseAccess(user.id, params.slug);

    if (!hasAccess) {
        // Redirect to Sales Page if not enrolled
        redirect(`/${params.locale}/courses/${params.slug}`);
    }

    // 3. Render content only if authorized
    return <CourseDetailMain params={params} />;
}
