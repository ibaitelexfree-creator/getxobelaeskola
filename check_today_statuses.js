
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A";

async function checkToday() {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const todayStr = '2026-02-12';

    const { data, error } = await supabase
        .from('reservas_alquiler')
        .select('id, estado_entrega')
        .eq('fecha_reserva', todayStr);

    if (error) console.error(error);
    else {
        const stats = data.reduce((acc, r) => {
            acc[r.estado_entrega] = (acc[r.estado_entrega] || 0) + 1;
            return acc;
        }, {});
        console.log('Today Statuses:', stats);
    }
}
checkToday();
