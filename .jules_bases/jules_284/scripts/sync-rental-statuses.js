
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xbledhifomblirxurtyv.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function syncStatuses() {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Get current date in Getxo (Europe/Madrid)
    const now = new Date();
    const todayStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Madrid',
        year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(now);

    console.log(`Today in Getxo: ${todayStr}`);

    // 1. All PAST rentals MUST be 'devuelto'
    console.log('Finalizing past rentals (fecha < today)...');
    const { error: errorPast } = await supabase
        .from('reservas_alquiler')
        .update({ estado_entrega: 'devuelto' })
        .lt('fecha_reserva', todayStr);

    if (errorPast) console.error('Error past:', errorPast);

    // 2. Any status "completado" should be "devuelto" (standardizing)
    console.log('Standardizing "completado" to "devuelto"...');
    await supabase
        .from('reservas_alquiler')
        .update({ estado_entrega: 'devuelto' })
        .eq('estado_entrega', 'completado');

    // 3. Today's rentals: Move to 'pendiente' if they were 'devuelto' (as per request)
    // The user said: "las de hoy en entregado o pendiente"
    console.log('Ensuring today\'s rentals are active (pendiente/entregado)...');
    const { error: errorToday } = await supabase
        .from('reservas_alquiler')
        .update({ estado_entrega: 'pendiente' })
        .eq('fecha_reserva', todayStr)
        .eq('estado_entrega', 'devuelto');

    if (errorToday) console.error('Error today:', errorToday);

    console.log('Sync complete.');
}

syncStatuses();
