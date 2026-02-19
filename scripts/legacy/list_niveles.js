
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envLocalPath = path.join(process.cwd(), '.env.local');
    const envPath = path.join(process.cwd(), '.env');
    let content = '';

    if (fs.existsSync(envLocalPath)) {
        content = fs.readFileSync(envLocalPath, 'utf8');
    } else if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf8');
    }

    const lines = content.split('\n');
    for (const line of lines) {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^"(.*)"$/, '$1');
            if (key && value) {
                process.env[key] = value;
            }
        }
    }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNiveles() {
    console.log("--- NIVELES FORMACION ---");
    const { data, error } = await supabase.from('niveles_formacion').select('*');
    if (error) console.error(error);
    else {
        if (data.length === 0) console.log("No levels found.");
        else data.forEach(n => console.log(`${n.nivel_numero}: ${n.titulo_es} (${n.id})`));
    }
}

checkNiveles();
