
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

// Configuration
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MAP_FILE = 'scripts/table_to_notion_map.json';
let MAPPING = {};

try {
    if (fs.existsSync(MAP_FILE)) {
        MAPPING = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
    } else {
        console.warn(`Warning: Map file ${MAP_FILE} not found. Using default empty mapping.`);
    }
} catch (e) {
    console.error("Error reading map file:", e);
}

/**
 * Utility to call Notion API using fetch
 */
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
    const data = await res.json();
    if (data.object === 'error') {
        throw new Error(`Notion Error [${data.code}]: ${data.message}`);
    }
    return data;
}

/**
 * Find a page in Notion by its Supabase_ID property
 */
async function findNotionPage(databaseId, supabaseId) {
    const res = await notionApi(`databases/${databaseId}/query`, 'POST', {
        filter: {
            property: 'Supabase_ID',
            rich_text: {
                equals: supabaseId
            }
        }
    });
    return res.results.length > 0 ? res.results[0] : null;
}

/**
 * Map Supabase row to Notion properties
 */
function mapRowToProperties(tableName, row) {
    const props = {
        'Supabase_ID': { rich_text: [{ text: { content: row.id || '' } }] }
    };

    // Generic mapping based on table
    if (tableName === 'profiles') {
        props['Title'] = { title: [{ text: { content: `${row.apellidos || ''}, ${row.nombre || row.email}` } }] };
        props['email'] = { rich_text: [{ text: { content: row.email || '' } }] };
        props['rol'] = { rich_text: [{ text: { content: row.rol || 'student' } }] };
        props['total_xp'] = { number: row.total_xp || 0 };
    } else if (tableName === 'embarcaciones') {
        props['Nombre'] = { title: [{ text: { content: row.nombre || 'Barco sin nombre' } }] };
        props['Tipo'] = { select: { name: row.tipo || 'crucero' } };
        props['Estado'] = { select: { name: row.estado || 'disponible' } };
        if (row.ultima_revision) props['Ultima_Revision'] = { date: { start: new Date(row.ultima_revision).toISOString().split('T')[0] } };
    } else if (tableName === 'reservas_alquiler') {
        const clientName = row.profiles ? `${row.profiles.nombre} ${row.profiles.apellidos || ''}` : 'Cliente Desconocido';
        const serviceName = row.servicios_alquiler ? row.servicios_alquiler.nombre_es : 'Servicio';

        props['Reserva'] = { title: [{ text: { content: `${clientName} - ${serviceName}` } }] };
        props['Monto'] = { number: Number(row.monto_total) || 0 };
        props['Estado Pago'] = { select: { name: row.estado_pago || 'pendiente' } };
        props['Estado Entrega'] = { select: { name: row.estado_entrega || 'pendiente' } };
        props['Fecha'] = { date: { start: row.fecha_reserva || new Date().toISOString().split('T')[0] } };
    } else if (tableName === 'mensajes_contacto') {
        props['Asunto'] = { title: [{ text: { content: row.asunto || 'Sin asunto' } }] };
        props['Remitente'] = { email: row.email };
        props['Estado'] = { select: { name: row.leido ? 'Atendido' : 'Nuevo' } };
    } else {
        props['Title'] = { title: [{ text: { content: row.nombre || row.titulo || row.id } }] };
    }

    return props;
}

async function syncTable(tableName) {
    const databaseId = MAPPING[tableName];
    if (!databaseId) return;

    console.log(`\n🚀 Syncing table: ${tableName}...`);

    const { data: rows, error } = await supabase.from(tableName).select('*');
    if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        return;
    }

    console.log(`Found ${rows.length} rows in Supabase.`);

    for (const row of rows) {
        try {
            // Manual Hydration for complex tables
            if (tableName === 'reservas_alquiler') {
                const { data: profile } = await supabase.from('profiles').select('nombre, apellidos').eq('id', row.perfil_id).single();
                const { data: service } = await supabase.from('servicios_alquiler').select('nombre_es').eq('id', row.servicio_id).single();
                row.profiles = profile;
                row.servicios_alquiler = service;
            }

            const existingPage = await findNotionPage(databaseId, row.id);
            const properties = mapRowToProperties(tableName, row);

            if (existingPage) {
                console.log(`Updating ${row.id}...`);
                await notionApi(`pages/${existingPage.id}`, 'PATCH', { properties });
            } else {
                console.log(`Creating ${row.id}...`);
                await notionApi('pages', 'POST', {
                    parent: { database_id: databaseId },
                    properties
                });
            }
            await new Promise(r => setTimeout(r, 200));
        } catch (e) {
            console.error(`Failed to sync row ${row.id}:`, e.message);
        }
    }
}

async function main() {
    // Only sync selected or all
    const tables = Object.keys(MAPPING);
    for (const table of tables) {
        await syncTable(table);
    }
    console.log('\n✅ Master Sync completed!');
}

main().catch(console.error);
