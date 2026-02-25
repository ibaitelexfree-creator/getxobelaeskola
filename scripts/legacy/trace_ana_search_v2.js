
const { createClient } = require('@supabase/supabase-js');
async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    console.log('Checking rentals with "ana" in fields...');
    const { data: rentals, error } = await supabase.from('reservas_alquiler')
        .select('*')
        .or('opcion_seleccionada.ilike.%ana%,estado_entrega.ilike.%ana%,estado_pago.ilike.%ana%')
        .limit(10);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Results:', rentals.length);
        rentals.forEach(r => {
            console.log(`- Rental ID: ${r.id}`);
            console.log(`  Opcion: ${r.opcion_seleccionada}`);
            console.log(`  Entreg: ${r.estado_entrega}`);
            console.log(`  Pago: ${r.estado_pago}`);
        });
    }
}
run();
