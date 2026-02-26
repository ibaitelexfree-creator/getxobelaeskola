
const { createClient } = require('@supabase/supabase-js');
async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
<<<<<<< HEAD
        process.env.SUPABASE_SERVICE_ROLE_KEY
=======
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A'
>>>>>>> pr-286
    );
    console.log('Searching for "NUEVO USUARIO" in profiles...');
    const { data, error } = await supabase.from('profiles')
        .select('*')
        .or('nombre.ilike.%NUEVO%,apellidos.ilike.%NUEVO%,nombre.ilike.%USUARIO%,apellidos.ilike.%USUARIO%');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Results:', data.length);
        data.slice(0, 10).forEach(p => console.log(`- ${p.nombre} ${p.apellidos} (${p.email})`));
    }
}
run();
