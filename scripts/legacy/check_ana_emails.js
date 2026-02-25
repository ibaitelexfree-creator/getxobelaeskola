
const { createClient } = require('@supabase/supabase-js');
async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY
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
