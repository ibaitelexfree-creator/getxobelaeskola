
import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function GET(_request: Request) {
    try {
        const auth = await requireInstructor();
        if (auth.error) return auth.error;
        const { supabaseAdmin } = auth;

        const { searchParams } = new URL(_request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status') || 'all';
        const query = searchParams.get('q') || '';

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let dbQuery = supabaseAdmin
            .from('reservas_alquiler')
            .select(`
                *,
                servicios_alquiler (nombre_es, nombre_eu)
            `, { count: 'exact' });

        if (status !== 'all') {
            dbQuery = dbQuery.eq('estado_entrega', status);
        }

        if (query) {
            // Search profiles for matching names or emails
            const { data: matchedProfiles } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .or(`nombre.ilike.%${query}%,apellidos.ilike.%${query}%`)
                .limit(50);

            const matchedProfileIds = (matchedProfiles as { id: string }[] || []).map((p) => p.id);

            // Search services for matching names
            const { data: matchedServices } = await supabaseAdmin
                .from('servicios_alquiler')
                .select('id')
                .or(`nombre_es.ilike.%${query}%,nombre_eu.ilike.%${query}%`)
                .limit(50);

            const matchedServiceIds = (matchedServices as { id: string }[] || []).map((s) => s.id);

            // Combine filters: 
            // 1. Matches in profile or service (from previous queries)
            // 2. Direct matches in the rentals table (status, payment, options, etc.)
            const conditions = [
                `estado_entrega.ilike.%${query}%`,
                `estado_pago.ilike.%${query}%`,
                `opcion_seleccionada.ilike.%${query}%`
            ];

            if (matchedProfileIds.length > 0) {
                conditions.push(`perfil_id.in.(${matchedProfileIds.join(',')})`);
            }
            if (matchedServiceIds.length > 0) {
                conditions.push(`servicio_id.in.(${matchedServiceIds.join(',')})`);
            }
            if (query.match(/^[0-9a-fA-F-]{36}$/)) {
                conditions.push(`id.eq.${query}`);
            }

            // Also allow searching by date if it looks like a date (YYYY-MM-DD or similar)
            if (query.match(/^\d{4}-\d{2}-\d{2}$/) || query.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                conditions.push(`fecha_reserva.eq.${query}`);
            }

            if (conditions.length > 0) {
                dbQuery = dbQuery.or(conditions.join(','));
            }
        }

        const sort = searchParams.get('sort') || 'recent';

        let orderCol = 'created_at';
        let ascending = false;

        if (sort === 'date_desc') {
            orderCol = 'fecha_reserva';
            ascending = false;
        } else if (sort === 'date_asc') {
            orderCol = 'fecha_reserva';
            ascending = true;
        } else if (sort === 'price_desc') {
            orderCol = 'monto_total';
            ascending = false;
        } else if (sort === 'price_asc') {
            orderCol = 'monto_total';
            ascending = true;
        }

        const { data: rentalsData, count, error } = await dbQuery
            .order(orderCol, { ascending })
            .order('hora_inicio', { ascending: false }) // Secondary sort by time
            .range(from, to);

        if (error) {
            console.error('Error fetching rentals:', error);
            throw error;
        }

        interface Rental {
            id: string;
            perfil_id: string;
            [key: string]: unknown;
        }
        interface Profile {
            id: string;
            nombre: string;
            apellidos: string;
            email: string;
            rol: string;
        }

        const typedRentals = (rentalsData || []) as unknown as Rental[];

        // Manual join for profiles since the FK might be missing
        const profileIds = Array.from(new Set(typedRentals.map(r => r.perfil_id).filter(Boolean)));
        let profilesData: Profile[] = [];

        if (profileIds.length > 0) {
            const { data: pData, error: pError } = await supabaseAdmin
                .from('profiles')
                .select('id, nombre, apellidos, email, rol')
                .in('id', profileIds);

            if (!pError && pData) {
                profilesData = pData as Profile[];
            }
        }

        const enrichedRentals = typedRentals.map(r => ({
            ...r,
            profiles: profilesData.find(p => p.id === r.perfil_id) || null
        }));

        return NextResponse.json({
            success: true,
            rentals: enrichedRentals,
            meta: {
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit)
            }
        });
    } catch (error: unknown) {
        const err = error as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
