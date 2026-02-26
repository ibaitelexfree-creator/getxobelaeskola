
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
    console.log('Searching for "ana" in profiles with name "Nuevo Usuario"...');
    const { data, error } = await supabase.from('profiles')
        .select('nombre, apellidos, email')
        .eq('nombre', 'Nuevo')
        .eq('apellidos', 'Usuario')
        .ilike('email', '%ana%');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Results:', data.length);
        data.forEach(p => console.log(`- ${p.email}`));
    }
}
run();
