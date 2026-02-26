import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import InstructorClient from '@/components/instructor/InstructorClient';
import { createAdminClient } from '@/lib/supabase/admin';
import { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
    return {
        title: locale === 'eu' ? 'Instruktore Panela' : 'Panel de Instructor',
        robots: { index: false, follow: false }
    };
}

export default async function InstructorPage({
    params: { locale }
}: {
    params: { locale: string }
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${locale}/auth/login`);
    }

    const supabaseAdmin = createAdminClient();
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
<<<<<<< HEAD
        .single() as { data: any, error: any };
=======
        .single();
>>>>>>> pr-286

    if (!profile || (profile.rol !== 'instructor' && profile.rol !== 'admin')) {
        redirect(`/${locale}/student/dashboard`);
    }

    // Initial data for the instructor
    // 1. Their sessions
    const { data: sessions } = await supabaseAdmin
        .from('sesiones')
        .select(`
            *,
            curso:cursos(id, nombre_es, nombre_eu),
            embarcacion:embarcaciones(id, nombre)
        `)
        .eq('instructor_id', user.id)
        .order('fecha_inicio', { ascending: false })
        .limit(10);

    // 2. Active courses (to show what's ongoing)
    const { data: activeInscriptions } = await supabaseAdmin
        .from('inscripciones')
        .select(`
            *,
            profiles(nombre, apellidos, email),
            ediciones_curso(
                *,
                cursos(*)
            )
        `)
        .eq('estado_pago', 'pagado')
        .limit(20);

    return (
        <InstructorClient
            profile={profile}
            initialSessions={sessions || []}
            initialInscriptions={activeInscriptions || []}
            locale={locale}
        />
    );
}
