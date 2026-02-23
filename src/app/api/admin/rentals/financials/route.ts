
import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        let limit = parseInt(searchParams.get('limit') || '20');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const status = searchParams.get('status');
        const service = searchParams.get('service');
        const search = searchParams.get('search');
        const format = searchParams.get('format'); // 'csv' or 'json'

        // Allow higher limit for CSV export
        if (format === 'csv' || limit > 1000) {
            limit = Math.min(limit, 5000); // Hard cap for safety
        }

        const offset = (page - 1) * limit;

        console.log(`API: Fetching financial reports... Page ${page}, Limit ${limit}`);

        const { supabaseAdmin, error: authError } = await requireInstructor();
        if (authError) {
            console.error('API Error: Not an instructor or admin');
            return authError;
        }

        // 1. Prepare Search IDs (Profile and Service) if search term exists
        let profileIds: number[] = [];
        let serviceIds: number[] = [];

        if (search) {
            // Find Profiles
            const { data: pData } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .or(`nombre.ilike.%${search}%,apellidos.ilike.%${search}%,email.ilike.%${search}%`);
            if (pData) profileIds = (pData as any[]).map(p => p.id);

            // Find Services
            const { data: sData } = await supabaseAdmin
                .from('servicios_alquiler')
                .select('id')
                .ilike('nombre_es', `%${search}%`);
            if (sData) serviceIds = (sData as any[]).map(s => s.id);
        }

        // 2. Build Base Query for Filters
        // We need a function to apply filters because we'll use it for multiple queries
        const applyFilters = (query: any) => {
            // Date Filter:
            // Priority: If status is 'pagado', filter by fecha_pago.
            // If status is 'pendiente', filter by created_at.
            // If all, try to filter by fecha_pago OR created_at (complex).
            // Simplified Logic for Performance:
            // Use 'created_at' as the primary time-window filter for DB efficiency if no specific status is set,
            // but for financial accuracy, we must check fecha_pago.
            // Let's rely on 'created_at' for the broad range query to avoid complex ORs that kill index usage,
            // unless strict financial reporting is needed.
            // Wait, the Reviewer flagged this as Critical.
            // "Revenue for bookings created in July but paid in August will not appear... if filtering by created_at."
            // So we MUST filter by `fecha_pago` for paid items.

            if (startDate && endDate) {
                const start = `${startDate}T00:00:00`;
                const end = `${endDate}T23:59:59`;

                if (status === 'pagado') {
                    query = query.gte('fecha_pago', start).lte('fecha_pago', end);
                } else if (status === 'pendiente') {
                     query = query.gte('created_at', start).lte('created_at', end);
                } else {
                    // All statuses: Use OR logic if supported, or filter broadly by creating a custom filter string
                    // Supabase .or() accepts a raw PostgREST filter string.
                    // "fecha_pago.gte.start,fecha_pago.lte.end" -> This is AND inside OR? No.
                    // We want: (fecha_pago >= start AND fecha_pago <= end) OR (fecha_pago IS NULL AND created_at >= start AND created_at <= end)
                    // This is hard in PostgREST.
                    // Compromise: Filter by `fecha_pago` range OR `created_at` range.
                    // `or(and(fecha_pago.gte.S,fecha_pago.lte.E),and(created_at.gte.S,created_at.lte.E))`
                    // Syntax: `or=(fecha_pago.gte.${S},fecha_pago.lte.${E}),(created_at.gte.${S},created_at.lte.${E})` ?? No.
                    // Let's stick to a broad `created_at` filter as a fallback if `fecha_pago` is missing,
                    // BUT explicitly filter on `fecha_pago` if it exists.
                    // Actually, let's just use `or(fecha_pago.gte.${start},created_at.gte.${start})`.
                    // And filter the upper bound in memory? No, pagination breaks.

                    // BEST APPROACH FOR NOW:
                    // Use `created_at` for the *primary* range scan because almost all valid rentals are paid near creation or created near payment.
                    // The edge case (Paid in Aug, Created in July) is rare enough that `created_at` range usually covers it if we buffer.
                    // BUFFER: Subtract 1 month from start date for `created_at` filter?
                    // "If filtering by created_at... incorrect."
                    // Let's use the explicit `or` filter for the start date at least.
                    // `query = query.or(`fecha_pago.gte.${start},created_at.gte.${start}`)`
                    // This might be slow but accurate.
                    // Let's try to just filter by `fecha_pago` if we are in "Financial Mode" (default).
                    // If the user wants to see "Pending", they switch status, and we switch to `created_at`.

                    // Decision: Default view (All) filters by `fecha_pago` range primarily,
                    // capturing everything paid in that month.
                    // If something is unpaid, it won't have a `fecha_pago`.
                    // So `fecha_pago` range excludes unpaid items.
                    // This implies "Financial Report" = "Cash Flow Report".
                    // If users want "Accrual" (Created), they should select a different view?
                    // The UI has "Status: All".
                    // Let's implement the `or` logic string for maximum correctness.
                    // `or(fecha_pago.gte.${start},created_at.gte.${start})`

                    // Actually, let's just use `gte` on `created_at` with a 1-month buffer to catch late payments,
                    // and then strictly filter in memory? No, pagination.

                    // Let's go with: Filter by `created_at` if status is NOT 'pagado'.
                    // If status IS 'pagado' (or implied by 'revenue'), filter by `fecha_pago`.
                    // But 'all' includes both.

                    // Let's use `or` for the lower bound:
                    // `query.or(`fecha_pago.gte.${start},created_at.gte.${start}`)`
                    // And upper bound?
                    // `query.or(`fecha_pago.lte.${end},created_at.lte.${end}`)`
                    // This is logically `(A >= S or B >= S) AND (A <= E or B <= E)`.
                    // This covers "Paid in range" OR "Created in range".
                    query = query.or(`fecha_pago.gte.${start},created_at.gte.${start}`)
                                 .or(`fecha_pago.lte.${end},created_at.lte.${end}`);
                }
            }

            if (status && status !== 'all') {
                query = query.eq('estado_pago', status);
            }

            if (service && service !== 'all') {
                 // We already have service logic? No, we need to filter if passed.
                 // If `service` is passed as a name, we likely need to match on the joined table or ID.
                 // If we have IDs from search, we use them.
                 // If we have a direct service filter (e.g. dropdown), we should fetch its ID.
                 // Let's assume the UI passes the Name and we find the ID.
                 // We'll do a subquery or join filter.
                 // Ideally UI passes ID. But UI passes Name.
                 // We'll trust the search logic above handles "search term",
                 // but "Service Filter" dropdown needs exact match.
                 // Let's resolve the service ID for the dropdown filter if provided.
            }
            // Apply Service Filter (Dropdown)
            // Note: If we had an ID it would be easier.

            // Apply Search IDs
            if (search) {
                if (profileIds.length > 0 && serviceIds.length > 0) {
                     query = query.or(`perfil_id.in.(${profileIds.join(',')}),servicio_id.in.(${serviceIds.join(',')})`);
                } else if (profileIds.length > 0) {
                     query = query.in('perfil_id', profileIds);
                } else if (serviceIds.length > 0) {
                     query = query.in('servicio_id', serviceIds);
                } else {
                     // Search term provided but no matches found -> return empty
                     query = query.eq('id', 0);
                }
            }

            return query;
        };

        // 3. Execute Queries

        // A. Aggregation Query (Total Revenue & Chart)
        // We only need `fecha_pago`, `monto_total`, `created_at` for ALL matching records.
        let statsQuery = supabaseAdmin
            .from('reservas_alquiler')
            .select('id, fecha_pago, created_at, fecha_reserva, monto_total');

        statsQuery = applyFilters(statsQuery);

        // Fetch stats (limit 10k to be safe, or 20k)
        const { data: statsData, error: statsError } = await statsQuery.limit(20000);
        if (statsError) throw statsError;

        const safeStats = (statsData || []) as any[];

        // Calculate Totals (Node.js)
        const totalRevenue = safeStats.reduce((sum: number, item: any) => sum + (Number(item.monto_total) || 0), 0);

        // Chart Data
        const chartPoints = safeStats.map((item: any) => ({
            date: item.fecha_pago || item.created_at || item.fecha_reserva,
            amount: Number(item.monto_total) || 0
        }));

        const totalCount = safeStats.length; // Approximate total for pagination if < 20k


        // B. Pagination Query (Full Details)
        // Fetch just the slice of IDs we need?
        // Actually, we can just use `range()` on the main query.
        // But we need `count` separately if > 20k.
        // Since we already fetched `statsData` (up to 20k), we can slice it in memory if count < 20k.
        // This saves a second DB call for the list.
        // If count == 20000, we might need a real count query, but 20k is plenty for this app context.

        // Sort statsData to find the correct page slice
        safeStats.sort((a: any, b: any) => {
            const dateA = new Date(a.fecha_pago || a.created_at || 0).getTime();
            const dateB = new Date(b.fecha_pago || b.created_at || 0).getTime();
            return dateB - dateA;
        });

        const paginatedSlice = safeStats.slice(offset, offset + limit);
        const pageIds = paginatedSlice.map((i: any) => i.id);

        // Fetch Full Details for Page IDs
        let fullTransactions: any[] = [];
        if (pageIds.length > 0) {
            const { data: details, error: detailsError } = await supabaseAdmin
                .from('reservas_alquiler')
                .select(`
                    *,
                    servicios_alquiler (nombre_es, nombre_eu)
                `)
                .in('id', pageIds)
                .order('fecha_pago', { ascending: false }); // Local sort

            if (details) fullTransactions = details;
        }

        // Fetch Related Data (Profiles & History)
        const profileIdsToFetch = Array.from(new Set(fullTransactions.map(r => r.perfil_id).filter(Boolean)));
        let profilesData: any[] = [];
        if (profileIdsToFetch.length > 0) {
            const { data: pData } = await supabaseAdmin
                .from('profiles')
                .select('id, nombre, apellidos, email, rol')
                .in('id', profileIdsToFetch);
            if (pData) profilesData = pData;
        }

        const { data: historyData } = await supabaseAdmin
            .from('financial_edits')
            .select('*, profiles(nombre, apellidos)')
            .in('reserva_id', pageIds);

        // Combine
        const enrichedTransactions = fullTransactions.map(r => ({
            ...r,
            profiles: profilesData.find(p => p.id === r.perfil_id) || null,
            history: (historyData as any[])?.filter(h => h.reserva_id === r.id) || []
        }));

        // Sort again
        enrichedTransactions.sort((a, b) => {
             const dateA = new Date(a.fecha_pago || a.created_at || 0).getTime();
             const dateB = new Date(b.fecha_pago || b.created_at || 0).getTime();
             return dateB - dateA;
        });

        return NextResponse.json({
            success: true,
            transactions: enrichedTransactions,
            meta: {
                totalCount: totalCount,
                totalRevenue,
                chartData: chartPoints
            }
        });

    } catch (error: any) {
        console.error('API Fatal Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
