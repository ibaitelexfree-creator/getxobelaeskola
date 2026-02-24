
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length === 2) {
        env[parts[0].trim()] = parts[1].trim();
    }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNiveles() {
    const { data: niveles } = await supabase
        .from('niveles_formacion')
        .select('id, nombre_es');

    let output = '--- NIVELES ---\n';
    niveles.forEach(n => {
        output += `${n.id} : ${n.nombre_es}\n`;
    });
    fs.writeFileSync('all_niveles.txt', output);
    console.log('Saved to all_niveles.txt');
}

checkNiveles();
