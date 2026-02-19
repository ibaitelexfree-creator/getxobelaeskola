
const fs = require('fs');
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MAP_FILE = 'scripts/table_to_notion_map.json';
let MAPPING = {};
try { MAPPING = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8')); } catch (e) { }

async function notionApi(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${NOTION_TOKEN}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        }
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`https://api.notion.com/v1/${endpoint}`, options);
    return res.json();
}

async function findNotionPage(databaseId, supabaseId) {
    const res = await notionApi(`databases/${databaseId}/query`, 'POST', {
        filter: { property: 'Supabase_ID', rich_text: { equals: supabaseId } }
    });
    return res.results?.length > 0 ? res.results[0] : null;
}

function mapRowToProperties(row) {
    const clientName = row.profiles ? `${row.profiles.nombre} ${row.profiles.apellidos || ''}` : 'Cliente Desconocido';
    const serviceName = row.servicios_alquiler ? row.servicios_alquiler.nombre_es : 'Servicio';
    return {
        'Supabase_ID': { rich_text: [{ text: { content: row.id || '' } }] },
        'Reserva': { title: [{ text: { content: `${clientName} - ${serviceName}` } }] },
        'Monto': { number: Number(row.monto_total) || 0 },
        'Estado Pago': { select: { name: row.estado_pago || 'pendiente' } },
        'Estado Entrega': { select: { name: row.estado_entrega || 'pendiente' } },
        'Fecha': { date: { start: row.fecha_reserva || new Date().toISOString().split('T')[0] } }
    };
}

async function syncRentals() {
    const dbId = MAPPING['reservas_alquiler'];
    if (!dbId) return console.error('No mapping for rentals');

    console.log(`🚀 Syncing Rentals to DB: ${dbId}`);

    // Check if DB is accessible
    const dbCheck = await notionApi(`databases/${dbId}`);
    if (dbCheck.object === 'error') {
        console.error('❌ Database Access Error:', dbCheck);
        return;
    }

    const { data: rows, error } = await supabase.from('reservas_alquiler').select('*');
    if (error) {
        console.error('Supabase Error:', error);
        return;
    }
    if (!rows) {
        console.log('No rows found in Supabase.');
        return;
    }
    console.log(`Found ${rows.length} rentals.`);

    for (const row of rows) {
        // Manual hydration fallback if join failed
        if (!row.profiles) {
            const { data: p } = await supabase.from('profiles').select('nombre, apellidos').eq('id', row.perfil_id).single();
            row.profiles = p;
        }
        if (!row.servicios_alquiler) {
            const { data: s } = await supabase.from('servicios_alquiler').select('nombre_es').eq('id', row.servicio_id).single();
            row.servicios_alquiler = s;
        }

        const props = mapRowToProperties(row);
        const existing = await findNotionPage(dbId, row.id);

        if (existing) {
            process.stdout.write('U');
            await notionApi(`pages/${existing.id}`, 'PATCH', { properties: props });
        } else {
            process.stdout.write('C');
            await notionApi('pages', 'POST', { parent: { database_id: dbId }, properties: props });
        }
    }
    console.log('\n✅ Rentals Synced!');
}

syncRentals();
