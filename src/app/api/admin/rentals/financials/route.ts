
import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        console.log('API: Fetching financial reports...');
        const { supabaseAdmin, error: authError } = await requireInstructor();

        if (authError) {
            console.error('API Error: Not an instructor or admin');
            return authError;
        }

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

        // Manual join for profiles since the FK might be missing in DB schema cache
        const profileIds = Array.from(new Set(rentalsData?.map((r: any) => r.perfil_id).filter(Boolean) || []));
        let profilesData: any[] = [];

        if (profileIds.length > 0) {
            const { data: pData, error: pError } = await supabaseAdmin
                .from('profiles')
                .select('id, nombre, apellidos, email, rol')
                .in('id', profileIds);

            if (!pError && pData) {
                profilesData = pData;
            } else if (pError) {
                console.error('API Profiles Error:', pError);
            }
        }

        // 5. Fetch History
        const { data: historyData, error: historyError } = await supabaseAdmin
            .from('financial_edits')
            .select('*, profiles(nombre, apellidos)')
            .in('reserva_id', rentalsData?.map((r: any) => r.id) || []);

        if (historyError) {
            console.error('API History Error:', historyError);
        }

        const enrichedRentals = rentalsData?.map((r: any) => ({
            ...r,
            profiles: profilesData.find((p: any) => p.id === r.perfil_id) || null,
            history: historyData?.filter((h: any) => h.reserva_id === r.id) || []
        })) || [];

        const { count, error: countError } = await supabaseAdmin
            .from('reservas_alquiler')
            .select('*', { count: 'exact', head: true });

        console.log(`API Success: Returned ${enrichedRentals.length} rentals. Total DB: ${count}`);

        return NextResponse.json({
            success: true,
            rentals: enrichedRentals,
            totalCount: count || 0
        });
    } catch (error: any) {
        console.error('API Fatal Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
