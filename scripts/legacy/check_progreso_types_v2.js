
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local manually
const envPath = path.resolve(__dirname, '.env');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
    console.error('Error reading .env.local:', e.message);
    process.exit(1);
}

const envConfig = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        if (key && value && !key.startsWith('#')) {
            envConfig[key] = value;
        }
    }
});

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking distinct tipo_entidad in progreso_alumno...');

    // We can't do distinct directly easily with JS client without RPC or raw SQL, 
    // but check specific counts for suspected bug.

    const { count: courseCount, error: courseError } = await supabase
        .from('progreso_alumno')
        .select('*', { count: 'exact', head: true })
        .eq('tipo_entidad', 'course');

    if (courseError) console.error('Error checking course:', courseError);
    else console.log("Rows with 'course':", courseCount);

    const { count: cursoCount, error: cursoError } = await supabase
        .from('progreso_alumno')
        .select('*', { count: 'exact', head: true })
        .eq('tipo_entidad', 'curso');

    if (cursoError) console.error('Error checking curso:', cursoError);
    else console.log("Rows with 'curso':", cursoCount);

    const { count: moduloCount, error: moduloError } = await supabase
        .from('progreso_alumno')
        .select('*', { count: 'exact', head: true })
        .eq('tipo_entidad', 'modulo');

    if (moduloError) console.error('Error checking modulo:', moduloError);
    else console.log("Rows with 'modulo':", moduloCount);

    const { count: unidadCount, error: unidadError } = await supabase
        .from('progreso_alumno')
        .select('*', { count: 'exact', head: true })
        .eq('tipo_entidad', 'unidad');

    if (unidadError) console.error('Error checking unidad:', unidadError);
    else console.log("Rows with 'unidad':", unidadCount);
}

check();
