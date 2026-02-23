
import { requireAdmin } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { supabaseAdmin, error: authError } = await requireAdmin();
        if (authError) return authError;

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const compare = searchParams.get('compare'); // 'yoy' or null

        // 1. Fetch Current Period Data
        let rentalsQuery = supabaseAdmin
            .from('reservas_alquiler')
            .select('*, servicios_alquiler(nombre_es, categoria), cupon_usado')
            .eq('estado_pago', 'pagado');

        let inscriptionsQuery = supabaseAdmin
            .from('inscripciones')
            .select('*, cursos(nombre_es, categoria_id), cupon_usado')
            .eq('estado_pago', 'pagado');

        if (startDate) {
            rentalsQuery = rentalsQuery.gte('fecha_pago', startDate);
            inscriptionsQuery = inscriptionsQuery.gte('created_at', startDate);
        }
        if (endDate) {
            rentalsQuery = rentalsQuery.lte('fecha_pago', endDate);
            inscriptionsQuery = inscriptionsQuery.lte('created_at', endDate);
        }

        const [
            { data: rentals, error: rError },
            { data: inscriptions, error: iError },
            { data: boats, error: bError },
            { data: maintenance, error: mError }
        ] = await Promise.all([
            rentalsQuery,
            inscriptionsQuery,
            supabaseAdmin.from('embarcaciones').select('*'),
            supabaseAdmin.from('mantenimiento_logs')
                .select('*, embarcaciones(nombre, tipo)')
                .gte('fecha_inicio', startDate || '2000-01-01')
                .lte('fecha_inicio', endDate || '2100-01-01')
        ]);

        if (rError) throw rError;
        if (iError) throw iError;
        if (bError) throw bError;
        if (mError) throw mError;

        // 2. Correlation/Comparison (YoY)
        let prevPeriodRevenue = 0;
        if (compare === 'yoy' && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const prevStart = new Date(start.getFullYear() - 1, start.getMonth(), start.getDate()).toISOString();
            const prevEnd = new Date(end.getFullYear() - 1, end.getMonth(), end.getDate()).toISOString();

            const [{ data: pRentals }, { data: pInscriptions }, { data: pMaintenance }] = await Promise.all([
                supabaseAdmin.from('reservas_alquiler').select('monto_total').eq('estado_pago', 'pagado').gte('fecha_pago', prevStart).lte('fecha_pago', prevEnd),
                supabaseAdmin.from('inscripciones').select('monto_total').eq('estado_pago', 'pagado').gte('created_at', prevStart).lte('created_at', prevEnd),
                supabaseAdmin.from('mantenimiento_logs').select('coste').gte('fecha_inicio', prevStart).lte('fecha_inicio', prevEnd)
            ]);

            const sumIncome = (arr: any[]) => (arr || []).reduce((acc, curr) => acc + (Number(curr.monto_total) || 0), 0);
            prevPeriodRevenue = sumIncome(pRentals || []) + sumIncome(pInscriptions || []);
        }

        // --- AGGREGATIONS ---

        // A. Profitability (Rentals by Service/Boat Type)
        const boatStats: Record<string, { revenue: number, cost: number }> = {};

        rentals?.forEach((r: any) => {
            const name = r.servicios_alquiler?.nombre_es || 'Otros';
            if (!boatStats[name]) boatStats[name] = { revenue: 0, cost: 0 };
            boatStats[name].revenue += (r.monto_total || 0);
        });

        maintenance?.forEach((m: any) => {
            // Map boat type to service category for comparison
            // Simplified mapping: "vela_ligera" -> "Optimist/Laser/Raquero", "crucero" -> "Veleros J80"
            let category = 'Otros';
            const bType = m.embarcaciones?.tipo;
            const bName = m.embarcaciones?.nombre || '';

            if (bType === 'crucero' || bName.includes('J80')) category = 'Veleros J80';
            else if (bName.includes('Optimist')) category = 'Optimist';
            else if (bName.includes('Laser')) category = 'Laser';
            else if (bName.includes('Raquero')) category = 'Raquero';

            if (!boatStats[category]) boatStats[category] = { revenue: 0, cost: 0 };
            boatStats[category].cost += (Number(m.coste) || 0);
        });

        // B. Course Demand by Month
        const courseCategoryDemand: Record<string, Record<string, number>> = {};
        inscriptions?.forEach((ins: any) => {
            const date = new Date(ins.created_at);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            const cat = ins.cursos?.nombre_es || 'General';

            if (!courseCategoryDemand[cat]) courseCategoryDemand[cat] = {};
            courseCategoryDemand[cat][monthKey] = (courseCategoryDemand[cat][monthKey] || 0) + 1;
        });

        // C. Revenue Reality vs Forecast
        // Since we don't have a forecast table, we'll generate a realistic target 
        // (e.g. cumulative sum with a 15% growth target over last year's average)
        const monthlyRevenue: Record<string, { actual: number, forecast: number }> = {};

        // Combine all income
        const allIncome = [
            ...(rentals || []).map((r: any) => ({ date: r.fecha_pago || r.created_at, amount: r.monto_total })),
            ...(inscriptions || []).map((i: any) => ({ date: i.created_at, amount: i.monto_total || 0 }))
        ];

        allIncome.forEach((item: any) => {
            const date = new Date(item.date);
            const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            if (!monthlyRevenue[key]) monthlyRevenue[key] = { actual: 0, forecast: 0 };
            monthlyRevenue[key].actual += (Number(item.amount) || 0);
        });

        // Generate dynamic forecast (simulated)
        const sortedMonths = Object.keys(monthlyRevenue).sort();
        let cumulativeActual = 0;
        let cumulativeForecast = 0;
        const avgMonthly = 5000; // Hardcoded baseline or could be calculated

        const chartRevenue = sortedMonths.map((m: any, i: any) => {
            cumulativeActual += monthlyRevenue[m].actual;
            cumulativeForecast += avgMonthly * 1.2; // 20% growth target
            return {
                month: m,
                actual: monthlyRevenue[m].actual,
                forecast: avgMonthly * 1.2,
                cumulativeActual,
                cumulativeForecast
            };
        });

        // D. Retention & Funnel Analytics
        const studentActivity: Record<string, { sessions: number, rentals: number, firstDate: Date }> = {};

        // Process ALL historical data for these students to determine retention
        const allStudentIds = Array.from(new Set([
            ...(inscriptions?.map((i: any) => i.perfil_id) || []),
            ...(rentals?.map((r: any) => r.perfil_id) || [])
        ]));

        const [{ data: historyInscriptions }, { data: historyRentals }] = await Promise.all([
            supabaseAdmin.from('inscripciones').select('perfil_id, created_at').in('perfil_id', allStudentIds),
            supabaseAdmin.from('reservas_alquiler').select('perfil_id, fecha_pago').in('perfil_id', allStudentIds)
        ]);

        historyInscriptions?.forEach((i: any) => {
            if (!studentActivity[i.perfil_id]) {
                studentActivity[i.perfil_id] = { sessions: 0, rentals: 0, firstDate: new Date(i.created_at) };
            }
            studentActivity[i.perfil_id].sessions++;
            const d = new Date(i.created_at);
            if (d < studentActivity[i.perfil_id].firstDate) studentActivity[i.perfil_id].firstDate = d;
        });

        historyRentals?.forEach((r: any) => {
            if (!studentActivity[r.perfil_id]) {
                studentActivity[r.perfil_id] = { sessions: 0, rentals: 0, firstDate: new Date(r.fecha_pago) };
            }
            studentActivity[r.perfil_id].rentals++;
            const d = new Date(r.fecha_pago);
            if (d < studentActivity[r.perfil_id].firstDate) studentActivity[r.perfil_id].firstDate = d;
        });

        const totalStudents = Object.keys(studentActivity).length;
        const recurringStudents = Object.values(studentActivity).filter((s: any) => s.sessions > 1).length;
        const studentRenters = Object.values(studentActivity).filter((s: any) => s.sessions > 0 && s.rentals > 0).length;
        const loyalCustomerCount = Object.values(studentActivity).filter((s: any) => (s.sessions + s.rentals) > 3).length;

        const funnel = [
            { step: 'Base de Usuarios', value: totalStudents, fill: '#8884d8' },
            { step: 'Alumnos Activos', value: Object.values(studentActivity).filter((s: any) => s.sessions > 0).length, fill: '#83a6ed' },
            { step: 'Alumnos Recurrentes', value: recurringStudents, fill: '#8dd1e1' },
            { step: 'Alumnos -> Alquiler', value: studentRenters, fill: '#82ca9d' },
            { step: 'Club (Fieles)', value: loyalCustomerCount, fill: '#a4de6c' }
        ];

        return NextResponse.json({
            success: true,
            boatProfitability: Object.entries(boatStats).map(([name, stats]) => ({
                name,
                revenue: stats.revenue,
                cost: stats.cost,
                profit: stats.revenue - stats.cost
            })),
            courseDemand: courseCategoryDemand,
            revenueComparison: chartRevenue,
            funnel,
            kpis: {
                totalRevenue: allIncome.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
                totalCouponRevenue: [
                    ...(rentals || []).filter((r: any) => (r as any).cupon_usado),
                    ...(inscriptions || []).filter((i: any) => (i as any).cupon_usado)
                ].reduce((acc: any, curr: any) => acc + (Number(curr.monto_total) || 0), 0),
                totalCost: (maintenance || []).reduce((acc: any, curr: any) => acc + (Number(curr.coste) || 0), 0),
                totalRentals: rentals?.length || 0,
                totalInscriptions: inscriptions?.length || 0,
                activeBoats: boats?.filter((b: any) => b.estado === 'disponible').length || 0,
                prevPeriodRevenue,
                retentionRate: totalStudents > 0 ? (recurringStudents / totalStudents * 100).toFixed(1) : 0
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
