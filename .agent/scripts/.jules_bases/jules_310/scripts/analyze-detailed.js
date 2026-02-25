
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function detailedAnalysis() {
    const { data: rentals, error } = await supabase
        .from('reservas_alquiler')
        .select('id, fecha_reserva, fecha_pago');

    if (error) { console.error(error); return; }

    const distinctDates = new Set();
    let sameDay = 0;

    // Sample first 5
    console.log("--- Muestra de 5 ---");
    rentals.slice(0, 5).forEach(r => {
        console.log(`ID: ${r.id.substring(0, 8)} | Res: ${r.fecha_reserva} | Pago: ${r.fecha_pago}`);
    });

    rentals.forEach(r => {
        if (!r.fecha_reserva || !r.fecha_pago) return;
        const d1 = r.fecha_reserva.split('T')[0]; // Assuming ISO string in DB
        const d2 = new Date(r.fecha_pago).toISOString().split('T')[0];

        distinctDates.add(d2);
        if (d1 === d2) sameDay++;
    });

    console.log("\n--- Estadísticas ---");
    console.log(`Total registros: ${rentals.length}`);
    console.log(`Fechas de pago distintas: ${distinctDates.size}`);
    console.log(`Coinciden día reserva y pago: ${sameDay} (${((sameDay / rentals.length) * 100).toFixed(1)}%)`);
    console.log(`No coinciden: ${rentals.length - sameDay} (${(((rentals.length - sameDay) / rentals.length) * 100).toFixed(1)}%)`);
}

detailedAnalysis();
