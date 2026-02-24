
const { createClient } = require('@supabase/supabase-js');
async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A'
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
