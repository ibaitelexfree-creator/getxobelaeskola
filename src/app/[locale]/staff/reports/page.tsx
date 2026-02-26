import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import FinancialReportsClient from '@/components/staff/FinancialReportsClient';
import Link from 'next/link';

export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale }));
}

export default async function FinancialReportsPage({
    params: { locale }
}: {
    params: { locale: string }
}) {
    const supabase = createClient();

    // 1. Authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect(`/${locale}/auth/login`);

    // 2. Role-based access (Using Admin Client to bypass RLS during check)
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabaseAdmin = createAdminClient();

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
<<<<<<< HEAD
        .single() as { data: any, error?: any };
=======
        .single();
>>>>>>> pr-286

    if (profile?.rol !== 'admin') {
        redirect(`/${locale}/staff`);
    }

    // 3. Fetch all data in parallel (Manual join since DB relations aren't auto-discovered)
    const [
        { data: rawRentals, error: rError },
        { data: allProfiles },
        { data: allServices }
    ] = await Promise.all([
        supabaseAdmin.from('reservas_alquiler').select('*').order('fecha_reserva', { ascending: false }).limit(2000),
        supabaseAdmin.from('profiles').select('id, nombre, apellidos'),
        supabaseAdmin.from('servicios_alquiler').select('id, nombre_es')
    ]);

    if (rError) {
        console.error('Error fetching rentals:', rError);
    }

<<<<<<< HEAD
    const enrichedRentals = (rawRentals || []).map((r: any) => ({
        ...r,
        profiles: allProfiles?.find((p: any) => p.id === r.perfil_id),
        servicios_alquiler: allServices?.find((s: any) => s.id === r.servicio_id)
=======
    const enrichedRentals = (rawRentals || []).map(r => ({
        ...r,
        profiles: allProfiles?.find(p => p.id === r.perfil_id),
        servicios_alquiler: allServices?.find(s => s.id === r.servicio_id)
>>>>>>> pr-286
    }));

    return (
        <div className="bg-nautical-black text-white min-h-screen">
            <div className="bg-mesh opacity-10 fixed inset-0 pointer-events-none" />
            <div className="container mx-auto px-6 pt-24 pb-20 relative z-10">
                <header className="mb-12 border-b border-white/5 pb-8 flex justify-between items-end">
                    <div>
                        <span className="text-accent uppercase tracking-[0.4em] text-[10px] font-bold mb-2 block">Análisis de Ingresos</span>
                        <h1 className="text-4xl md:text-6xl font-display italic">Informes <span className="text-accent">Financieros</span></h1>
                    </div>
                    <Link href={`/${locale}/staff`} className="text-[10px] uppercase tracking-widest text-white/40 hover:text-accent font-bold px-4 py-2 border border-white/10 hover:bg-white/5 transition-all">
                        ← Volver al Panel
                    </Link>
                </header>

                <React.Suspense fallback={
                    <div className="py-20 text-center">
                        <div className="w-12 h-12 border-t-2 border-accent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-technical animate-pulse">Cargando bitácora financiera...</p>
                    </div>
                }>
                    <FinancialReportsClient initialData={enrichedRentals} />
                </React.Suspense>
            </div>
        </div>
    );
}
