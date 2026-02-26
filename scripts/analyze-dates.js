
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function analyzeDates() {
    const { data: rentals, error } = await supabase
        .from('reservas_alquiler')
        .select('fecha_reserva, fecha_pago');

    if (error) {
        console.error('Error:', error);
        return;
    }

    let sameDayCount = 0;
    let differentDayCount = 0;
    let total = rentals.length;

    rentals.forEach(r => {
        if (!r.fecha_pago || !r.fecha_reserva) return;

        const d1 = new Date(r.fecha_reserva).toISOString().split('T')[0];
        const d2 = new Date(r.fecha_pago).toISOString().split('T')[0];

        if (d1 === d2) sameDayCount++;
        else differentDayCount++;
    });

    console.log(`Total: ${total}`);
    console.log(`Mismo día: ${sameDayCount} (${((sameDayCount / total) * 100).toFixed(1)}%)`);
    console.log(`Día diferente: ${differentDayCount} (${((differentDayCount / total) * 100).toFixed(1)}%)`);
}

analyzeDates();
