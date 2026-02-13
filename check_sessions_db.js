
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
    }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSessions() {
    const { data, error } = await supabase
        .from('sesiones')
        .select(`
        *,
        curso:cursos(id, nombre_es, nombre_eu),
        instructor:profiles!sesiones_instructor_id_fkey(id, nombre, apellidos),
        embarcacion:embarcaciones(id, nombre)
    `);

    if (error) {
        console.error('Error fetching sessions:', error);
    } else {
        console.log('Sessions found:', data.length);
    }
}

checkSessions();
