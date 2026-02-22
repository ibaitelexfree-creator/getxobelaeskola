import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import FinancialReportsClient from '@/components/staff/FinancialReportsClient';
import Link from 'next/link';

export function generateStaticParams() {
    return ['es', 'eu', 'en', 'fr'].map(locale => ({ locale }));
}

export default async function FinancialReportsPage({
    params: { locale },
    searchParams
}: {
    params: { locale: string },
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const supabase = createClient();

    // 1. Authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect(`/${locale}/auth/login`);

    // 2. Role-based access
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabaseAdmin = createAdminClient();

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .single();

    if (profile?.rol !== 'admin') {
        redirect(`/${locale}/staff`);
    }

    // 3. Parse Search Params
    const view = (searchParams.view as string) || 'year';
    const page = parseInt((searchParams.page as string) || '1');
    const pageSize = parseInt((searchParams.limit as string) || '50');
    const search = (searchParams.search as string) || '';
    const statusFilter = (searchParams.status as string) || 'all';
    const serviceFilterName = (searchParams.service as string) || 'all'; // Name or 'all'

    // Determine Date Range
    let startDate = (searchParams.startDate as string) || '';
    let endDate = (searchParams.endDate as string) || '';

    const getxoDate = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(d);
    const now = new Date();

    if (!startDate || !endDate) {
        endDate = getxoDate(now);
        if (view === 'today') {
            startDate = endDate;
        } else if (view === 'week') {
            const lastWeek = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
            startDate = getxoDate(lastWeek);
        } else if (view === 'month') {
            const d = new Date(now);
            d.setDate(1);
            startDate = getxoDate(d);
        } else {
            // Default year
            const lastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            startDate = getxoDate(lastYear);
        }
    }

    // 4. Fetch Services (needed for ID resolution and UI dropdown)
    const { data: allServices } = await supabaseAdmin
        .from('servicios_alquiler')
        .select('id, nombre_es')
        .order('nombre_es');

    // Resolve Service ID from Name if filter is active
    let serviceId: string | null = null;
    if (serviceFilterName !== 'all' && allServices) {
        const found = allServices.find(s => s.nombre_es === serviceFilterName);
        if (found) serviceId = found.id;
    }

    // 5. Build Query for Rentals List using VIEW for consistency
    const fromIndex = (page - 1) * pageSize;
    const toIndex = fromIndex + pageSize - 1;

    // Use the VIEW defined in migration to ensure consistent filtering (effective_date)
    // and robust search (name + surname + service)
    let query = supabaseAdmin.from('financial_reports_view')
        .select('*', { count: 'exact' })
        .order('effective_date', { ascending: false })
        .range(fromIndex, toIndex);

    // Apply Filters Consistent with RPC logic
    if (startDate) query = query.gte('effective_date', startDate);
    if (endDate) query = query.lte('effective_date', endDate);

    if (statusFilter !== 'all') {
        query = query.eq('estado_pago', statusFilter);
    }

    if (serviceId) {
        query = query.eq('servicio_id', serviceId);
    }

    if (search) {
        // Robust search across name, surname, and service name using the View's flat columns
        query = query.or(`client_name.ilike.%${search}%,client_surname.ilike.%${search}%,service_name.ilike.%${search}%`);
    }

    const { data: rawData, count, error: rError } = await query;

    if (rError) {
        console.error('Error fetching rentals:', rError);
    }

    // Map flat View results to the nested structure expected by Client Component
    const rentals = (rawData || []).map((r: any) => ({
        ...r,
        profiles: {
            nombre: r.client_name,
            apellidos: r.client_surname
        },
        servicios_alquiler: {
            nombre_es: r.service_name
        }
    }));

    // 6. Fetch Aggregated Stats via RPC
    const { data: statsData, error: statsError } = await supabaseAdmin.rpc('get_financial_report_stats', {
        p_start_date: startDate,
        p_end_date: endDate,
        p_status: statusFilter === 'all' ? null : statusFilter,
        p_service_id: serviceId || null
    });

    if (statsError) {
        console.error('Error fetching stats:', statsError);
    }

    const stats = statsData || { total_revenue: 0, daily_stats: [] };

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
                    <FinancialReportsClient
                        paginatedData={rentals || []}
                        totalRecords={count || 0}
                        stats={stats}
                        services={allServices || []}
                        initialParams={{
                            view,
                            startDate,
                            endDate,
                            page,
                            limit: pageSize,
                            search,
                            status: statusFilter,
                            service: serviceFilterName
                        }}
                    />
                </React.Suspense>
            </div>
        </div>
    );
}
