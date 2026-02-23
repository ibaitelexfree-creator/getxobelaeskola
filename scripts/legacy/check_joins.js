const { createClient } = require('@supabase/supabase-js');

async function checkJoins() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A'
    );

    console.log('--- Checking JOIN query ---');
    const { data, error } = await supabase
        .from('reservas_alquiler')
        .select(`
            *,
            profiles!perfil_id(nombre, apellidos),
            servicios_alquiler!servicio_id(nombre_es)
        `)
        .limit(1);

    if (error) {
        console.error('JOIN Error:', error);
        console.log('\nTrying without explicit FK hints...');
        const { data: data2, error: error2 } = await supabase
            .from('reservas_alquiler')
            .select(`
                *,
                profiles(nombre, apellidos),
                servicios_alquiler(nombre_es)
            `)
            .limit(1);
        if (error2) console.error('Join Error 2:', error2);
        else console.log('Join Success 2:', data2);
    } else {
        console.log('Join Success:', data);
    }
}

checkJoins();
