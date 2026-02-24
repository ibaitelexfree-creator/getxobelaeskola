
import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        console.log('API: Fetching financial reports...');
        const auth = await requireInstructor();

        if (auth.error) {
            console.error('API Error: Not an instructor or admin');
            return auth.error;
        }
        const { supabaseAdmin } = auth;

        const { data: rentalsData, error } = await supabaseAdmin
            .from('reservas_alquiler')
            .select(`
                *,
                fecha_pago,
                estado_pago,
                servicios_alquiler (nombre_es, nombre_eu)
            `)
            .order('fecha_pago', { ascending: false })
            .limit(10000);

        if (error) {
            console.error('API DB Error:', error);
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
        interface HistoryEntry {
            reserva_id: string;
            [key: string]: unknown;
        }

        const typedRentals = (rentalsData || []) as unknown as Rental[];

        // Manual join for profiles since the FK might be missing in DB schema cache
        const profileIds = Array.from(new Set(typedRentals.map(r => r.perfil_id).filter(Boolean)));
        let profilesData: Profile[] = [];

        if (profileIds.length > 0) {
            const { data: pData, error: pError } = await supabaseAdmin
                .from('profiles')
                .select('id, nombre, apellidos, email, rol')
                .in('id', profileIds);

            if (!pError && pData) {
                profilesData = pData as Profile[];
            } else if (pError) {
                console.error('API Profiles Error:', pError);
            }
        }

        // 5. Fetch History
        const { data: historyData, error: historyError } = await supabaseAdmin
            .from('financial_edits')
            .select('*, profiles(nombre, apellidos)')
            .in('reserva_id', typedRentals.map(r => r.id));

        const typedHistory = (historyData || []) as unknown as HistoryEntry[];

        if (historyError) {
            console.error('API History Error:', historyError);
        }

        const enrichedRentals = typedRentals.map(r => ({
            ...r,
            profiles: profilesData.find(p => p.id === r.perfil_id) || null,
            history: typedHistory.filter(h => h.reserva_id === r.id) || []
        }));

        const { count } = await supabaseAdmin
            .from('reservas_alquiler')
            .select('*', { count: 'exact', head: true });

        console.log(`API Success: Returned ${enrichedRentals.length} rentals. Total DB: ${count}`);

        return NextResponse.json({
            success: true,
            rentals: enrichedRentals,
            totalCount: count || 0
        });
    } catch (error: unknown) {
        const err = error as Error;
        console.error('API Fatal Error:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
