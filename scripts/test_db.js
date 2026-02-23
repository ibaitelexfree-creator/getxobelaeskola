
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...value] = line.split('=');
    if (key && value) acc[key.trim()] = value.join('=').trim();
    return acc;
}, {});

async function testSupabase() {
    const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log("Testing tables...");
    const tables = ['profiles', 'inscripciones', 'reservas_alquiler', 'progreso_alumno', 'certificados', 'horas_navegacion', 'cursos', 'ediciones_curso'];

    for (const table of tables) {
        try {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                console.error(`Error on table ${table}:`, error.message);
            } else {
                console.log(`Table ${table} is OK.`);
            }
        } catch (e) {
            console.error(`Exception on table ${table}:`, e.message);
        }
    }
}

testSupabase();
