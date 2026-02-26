
import { requireInstructor } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        console.log('API: Fetching financial reports...');
<<<<<<< HEAD
        const auth = await requireInstructor();

        if (auth.error) {
            console.error('API Error: Not an instructor or admin');
            return auth.error;
        }
        const { supabaseAdmin } = auth;
=======
        const { supabaseAdmin, error: authError } = await requireInstructor();

        if (authError) {
            console.error('API Error: Not an instructor or admin');
            return authError;
        }
>>>>>>> pr-286

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

<<<<<<< HEAD
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
=======
        // Manual join for profiles since the FK might be missing in DB schema cache
        const profileIds = Array.from(new Set(rentalsData?.map(r => r.perfil_id).filter(Boolean) || []));
        let profilesData: any[] = [];
>>>>>>> pr-286

        if (profileIds.length > 0) {
            const { data: pData, error: pError } = await supabaseAdmin
                .from('profiles')
                .select('id, nombre, apellidos, email, rol')
                .in('id', profileIds);

            if (!pError && pData) {
<<<<<<< HEAD
                profilesData = pData as Profile[];
=======
                profilesData = pData;
>>>>>>> pr-286
            } else if (pError) {
                console.error('API Profiles Error:', pError);
            }
        }

        // 5. Fetch History
        const { data: historyData, error: historyError } = await supabaseAdmin
            .from('financial_edits')
            .select('*, profiles(nombre, apellidos)')
<<<<<<< HEAD
            .in('reserva_id', typedRentals.map(r => r.id));

        const typedHistory = (historyData || []) as unknown as HistoryEntry[];
=======
            .in('reserva_id', rentalsData?.map(r => r.id) || []);
>>>>>>> pr-286

        if (historyError) {
            console.error('API History Error:', historyError);
        }

<<<<<<< HEAD
        const enrichedRentals = typedRentals.map(r => ({
            ...r,
            profiles: profilesData.find(p => p.id === r.perfil_id) || null,
            history: typedHistory.filter(h => h.reserva_id === r.id) || []
        }));

        const { count } = await supabaseAdmin
=======
        const enrichedRentals = rentalsData?.map(r => ({
            ...r,
            profiles: profilesData.find(p => p.id === r.perfil_id) || null,
            history: historyData?.filter(h => h.reserva_id === r.id) || []
        })) || [];

        const { count, error: countError } = await supabaseAdmin
>>>>>>> pr-286
            .from('reservas_alquiler')
            .select('*', { count: 'exact', head: true });

        console.log(`API Success: Returned ${enrichedRentals.length} rentals. Total DB: ${count}`);

        return NextResponse.json({
            success: true,
            rentals: enrichedRentals,
            totalCount: count || 0
        });
<<<<<<< HEAD
    } catch (error: unknown) {
        const err = error as Error;
        console.error('API Fatal Error:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
=======
    } catch (error: any) {
        console.error('API Fatal Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
>>>>>>> pr-286
    }
}
