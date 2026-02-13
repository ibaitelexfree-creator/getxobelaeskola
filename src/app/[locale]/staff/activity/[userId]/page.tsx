import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ActivityListClient from '@/components/staff/ActivityListClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StaffActivityPage({
    params: { locale, userId }
}: {
    params: { locale: string; userId: string }
}) {
    const supabaseAdmin = createAdminClient();
    const supabase = createClient();

    // Verify requester is staff
    const { data: { user: requester } } = await supabase.auth.getUser();
    if (!requester) return notFound();

    const { data: requesterProfile } = await supabaseAdmin
        .from('profiles')
        .select('rol')
        .eq('id', requester.id)
        .single();

    if (requesterProfile?.rol !== 'admin' && requesterProfile?.rol !== 'instructor') {
        return notFound();
    }

    // Get Target Staff Info
    const { data: staff } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (!staff) return notFound();

    // Get Activity Logs & All Profiles for reference
    const [
        { data: logs, error: logsError },
        { data: allProfiles }
    ] = await Promise.all([
        supabaseAdmin
            .from('audit_logs')
            .select('*')
            .eq('staff_id', userId)
            .order('created_at', { ascending: false }),
        supabaseAdmin
            .from('profiles')
            .select('id, nombre, apellidos, rol')
    ]);

    if (logsError) {
        console.error('ACTIVITY FETCH ERROR:', logsError);
    }

    // console.log(`Fetched ${logs?.length || 0} logs for staff ${userId}`);

    return (
        <div className="bg-nautical-black text-white min-h-screen pt-32 pb-24 px-6 relative">
            <div className="bg-mesh opacity-10 fixed inset-0 pointer-events-none" />

            <div className="container mx-auto relative z-10">
                <Link href={`/${locale}/staff`} className="text-[10px] uppercase tracking-widest text-white/40 hover:text-accent mb-8 block transition-all">
                    ← Volver al Panel
                </Link>

                <header className="mb-16">
                    <span className="text-accent uppercase tracking-[0.4em] text-[10px] font-bold mb-4 block">Historial de Operaciones</span>
                    <h1 className="text-5xl font-display italic">
                        Actividad de <span className="text-accent">{staff.nombre} {staff.apellidos}</span>
                    </h1>
                    <p className="text-technical mt-4 opacity-40 uppercase tracking-widest">{staff.rol}</p>
                </header>

                <ActivityListClient
                    initialLogs={logs || []}
                    isAdmin={requesterProfile?.rol === 'admin'}
                    allProfiles={allProfiles || []}
                />
            </div>
        </div>
    );
}
