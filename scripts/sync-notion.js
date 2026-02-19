
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const NOTION_TOKEN = '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';
const SUPABASE_URL = 'https://xbledhifomblirxurtyv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MAPPING = {
    'profiles': '30c31210-b1a1-81dc-b024-f10ba9ab4221',
    'embarcaciones': '30c31210-b1a1-813b-a949-d7ddf66d84c9',
    'mensajes_contacto': '30c31210-b1a1-8114-a87f-e69aa8111223',
    'inscripciones': '30c31210-b1a1-817a-8b77-fe8eb4c4551d',
    'mantenimiento_logs': '30c31210-b1a1-8107-aea1-fd37d1fa3708'
};

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
        props['Nombre'] = { title: [{ text: { content: row.nombre || 'Barco sin nombre' } }] }; // Fixed Title prop name for this DB
        props['Tipo'] = { select: { name: row.tipo || 'crucero' } };
        props['Estado'] = { select: { name: row.estado || 'disponible' } };
        if (row.ultima_revision) props['Ultima_Revision'] = { date: { start: new Date(row.ultima_revision).toISOString().split('T')[0] } };
    } else if (tableName === 'mensajes_contacto') {
        props['Asunto'] = { title: [{ text: { content: row.asunto || 'Sin asunto' } }] };
        props['Remitente'] = { email: row.email };
        props['Estado'] = { select: { name: row.leido ? 'Atendido' : 'Nuevo' } };
    } else {
        // Fallback for Title
        props['Title'] = { title: [{ text: { content: row.nombre || row.titulo || row.id } }] };
    }

    return props;
}

async function syncTable(tableName) {
    const databaseId = MAPPING[tableName];
    if (!databaseId) {
        console.error(`No mapping for table ${tableName}`);
        return;
    }

    console.log(`\n🚀 Syncing table: ${tableName}...`);

    const { data: rows, error } = await supabase.from(tableName).select('*');
    if (error) {
        console.error(`Error fetching ${tableName} from Supabase:`, error);
        return;
    }

    console.log(`Found ${rows.length} rows in Supabase.`);

    for (const row of rows) {
        try {
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
            // Small sleep to avoid rate limits
            await new Promise(r => setTimeout(r, 300));
        } catch (e) {
            console.error(`Failed to sync row ${row.id}:`, e.message);
        }
    }
}

async function main() {
    const tables = Object.keys(MAPPING);
    for (const table of tables) {
        await syncTable(table);
    }
    console.log('\n✅ Sync completed!');
}

main().catch(console.error);
