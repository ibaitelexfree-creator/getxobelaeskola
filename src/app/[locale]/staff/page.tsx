import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import StaffClient from '@/components/staff/StaffClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Rental {
    fecha_reserva: string;
    monto_total: number;
    profiles?: {
        rol: string;
    };
}

export default async function StaffPage({ params: { locale } }: { params: { locale: string } }) {
    const supabase = createClient();

    // 1. Authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect(`/${locale}/auth/login`);

    // 2. Role-based access (Using Admin Client to bypass RLS during check)
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabaseAdmin = createAdminClient();

    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, rol, nombre, apellidos, email')
        .eq('id', user.id)
        .single();

    if (profileError || (profile?.rol !== 'admin' && profile?.rol !== 'instructor')) {
        redirect(`/${locale}/student/dashboard`);
    }

    const currentUserProfile = profile;

    // 3. Data Fetching (Parallel queries for efficiency)
    const today = new Date().toISOString().split('T')[0];
    const firstOfMonth = today.slice(0, 7) + '-01';
    const firstOfYear = today.slice(0, 4) + '-01-01';

    let rawRentalsData: any[] = [];
    let chartRentals: any[] = [];
    let socioCount = 0;
    let todayRevData: any[] = [];
    let monthRevData: any[] = [];
    let yearRevData: any[] = [];
    let totalStudentCount = 0;

    try {
        const results = await Promise.allSettled([
            supabaseAdmin.from('reservas_alquiler')
                .select('*, servicios_alquiler(*)')
                .order('created_at', { ascending: false })
                .limit(50), // Limited to 50 for the dashboard
            supabaseAdmin.from('reservas_alquiler')
                .select('fecha_pago, monto_total')
                // DEBUG: SHOW ALL - Fetching all history for dynamic scaling
                .order('fecha_pago', { ascending: true }),
            supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('rol', 'socio'),
            supabaseAdmin.from('reservas_alquiler').select('monto_total').gte('fecha_pago', new Date().toISOString().split('T')[0] + 'T00:00:00Z'),
            supabaseAdmin.from('reservas_alquiler').select('monto_total').gte('fecha_pago', firstOfMonth + 'T00:00:00Z'),
            supabaseAdmin.from('reservas_alquiler').select('monto_total').gte('fecha_pago', firstOfYear + 'T00:00:00Z'),
            supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('rol', 'alumno')
        ]);

        if (results[0].status === 'fulfilled') rawRentalsData = results[0].value.data || [];
        if (results[1].status === 'fulfilled') chartRentals = results[1].value.data || [];
        if (results[2].status === 'fulfilled') socioCount = results[2].value.count || 0;
        if (results[3].status === 'fulfilled') todayRevData = results[3].value.data || [];
        if (results[4].status === 'fulfilled') monthRevData = results[4].value.data || [];
        if (results[5].status === 'fulfilled') yearRevData = results[5].value.data || [];
        if (results[6].status === 'fulfilled') totalStudentCount = results[6].value.count || 0;
    } catch (err) {
        console.error('Critical data fetching error in staff page:', err);
    }

    // Manual join for profiles to bypass missing FK relationship
    const profileIds = Array.from(new Set(rawRentalsData.map(r => r.perfil_id).filter(Boolean)));
    let enrichData: any[] = [];
    if (profileIds.length > 0) {
        const { data: pData } = await supabaseAdmin
            .from('profiles')
            .select('id, nombre, apellidos, email, rol')
            .in('id', profileIds);
        enrichData = pData || [];
    }

    const rentals = rawRentalsData.map(r => ({
        ...r,
        profiles: enrichData.find(p => p.id === r.perfil_id) || null
    }));

    // User Segmentation Logic (Simplified)
    const enrichedRentals = rentals;
    let todayRentals = enrichedRentals.filter(r => r.fecha_reserva === today);
    if (todayRentals.length === 0 && enrichedRentals.length > 0) {
        todayRentals = enrichedRentals.slice(0, 5);
    }

    // Summary calculation for stats
    const sumMonto = (data: { monto_total: number }[] | null) => (data || []).reduce((acc, r) => acc + (Number(r.monto_total) || 0), 0);

    const stats = {
        todayRevenue: sumMonto(todayRevData),
        monthlyRevenue: sumMonto(monthRevData),
        yearlyRevenue: sumMonto(yearRevData),
        studentCount: totalStudentCount,
        socioCount: socioCount,
        studentRentersCount: socioCount > 0 ? socioCount : 0, // Fallback placeholder
        nonStudentRentersCount: (todayRevData || []).length
    };


    return (
        <div className="bg-nautical-black text-white min-h-screen">
            <div className="bg-mesh opacity-10 fixed inset-0 pointer-events-none" />
            <div className="container mx-auto px-6 pt-24 pb-20 relative z-10">
                <header className="mb-8 border-b border-white/5 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <span className="text-accent uppercase tracking-[0.4em] text-[10px] font-bold mb-2 block">Sistema de Control Central</span>
                        <h1 className="text-4xl md:text-6xl font-display italic">Panel de <span className="text-accent">Administración</span></h1>
                    </div>
                    <div className="flex gap-4">
                        <Link href={`/${locale}/instructor`} className="text-[10px] uppercase tracking-widest text-accent hover:text-white font-bold px-4 py-2 border border-accent/20 hover:bg-accent/10 transition-all">
                            Vista Instructor
                        </Link>
                        <Link href={`/${locale}/academy`} className="text-[10px] uppercase tracking-widest text-white/40 hover:text-sea-foam font-bold px-4 py-2 border border-white/10 hover:bg-white/5 transition-all">
                            Ir a Academia →
                        </Link>
                    </div>
                </header>

                <StaffClient
                    userProfile={currentUserProfile}
                    initialRentals={todayRentals}
                    allRentals={enrichedRentals}
                    locale={locale}
                    stats={stats}
                    chartData={chartRentals || []}
                />
            </div>
        </div>
    );
}
