
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envLocalPath = path.join(process.cwd(), '.env.local');
    const envPath = path.join(process.cwd(), '.env');
    let content = '';
    if (fs.existsSync(envLocalPath)) content = fs.readFileSync(envLocalPath, 'utf8');
    else if (fs.existsSync(envPath)) content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) process.env[key.trim()] = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1');
    });
}
loadEnv();

async function fixDbTranslations() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Fix servicios_alquiler
    const { data: serv } = await supabase.from('servicios_alquiler').select('*');
    for (const s of serv) {
        let update = {};
        if (!s.nombre_eu || s.nombre_eu === s.nombre_es) {
            // Basic translations for common items
            if (s.nombre_es === 'Raquero') update.nombre_eu = 'Raqueroa';
            if (s.nombre_es === 'Vela Ligera') update.nombre_eu = 'Bela Arina';
            if (s.nombre_es === 'Kayak') update.nombre_eu = 'Kayaka';
            if (s.nombre_es === 'Paddle Surf') update.nombre_eu = 'Paddle Surfa';
        }
        if (Object.keys(update).length > 0) {
            console.log(`Updating ${s.nombre_es} to ${update.nombre_eu}`);
            await supabase.from('servicios_alquiler').update(update).eq('id', s.id);
        }
    }

    // Fix cursos
    const { data: cursos } = await supabase.from('cursos').select('*');
    for (const c of cursos) {
        let update = {};
        if (!c.nombre_eu || c.nombre_eu === c.nombre_es) {
            if (c.nombre_es.includes('Iniciación')) update.nombre_eu = c.nombre_es.replace('Iniciación', 'Inisiazioa');
            if (c.nombre_es.includes('Perfeccionamiento')) update.nombre_eu = c.nombre_es.replace('Perfeccionamiento', 'Hobetzea');
            if (c.nombre_es.includes('Vela Ligera')) update.nombre_eu = c.nombre_es.replace('Vela Ligera', 'Bela Arina');
            if (c.nombre_es.includes('Licencia de Navegación')) update.nombre_eu = 'Nabigazio Lizentzia';
        }
        if (Object.keys(update).length > 0) {
            console.log(`Updating Course ${c.nombre_es} to ${update.nombre_eu}`);
            await supabase.from('cursos').update(update).eq('id', c.id);
        }
    }
}

fixDbTranslations();
