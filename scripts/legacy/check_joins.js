const { createClient } = require('@supabase/supabase-js');

async function checkJoins() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY
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
