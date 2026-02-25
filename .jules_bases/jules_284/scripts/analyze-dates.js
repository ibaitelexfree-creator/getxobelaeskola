
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
