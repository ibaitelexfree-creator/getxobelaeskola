
const fs = require('fs');
const { Client } = require('@notionhq/client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xbledhifomblirxurtyv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NOTION_TOKEN = process.env.NOTION_TOKEN;

if (!SUPABASE_KEY || !NOTION_TOKEN) {
    console.error("Missing keys in .env (SUPABASE_SERVICE_ROLE_KEY or NOTION_TOKEN)");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const notion = new Client({ auth: NOTION_TOKEN });

console.log("Notion Client Keys:", Object.keys(notion));
if (notion.databases) console.log("Notion Databases Keys:", Object.keys(notion.databases));

const TABLE_MAP = JSON.parse(fs.readFileSync('scripts/table_to_notion_map.json', 'utf8'));

// Main tables to sync for the "Premium" look
const TARGET_TABLES = ['profiles', 'embarcaciones', 'reservas_alquiler', 'cursos', 'instructores'];

async function syncTable(tableName) {
    const dbId = TABLE_MAP[tableName];
    if (!dbId) {
        console.log(`Skipping ${tableName} (No mapping found)`);
        return;
    }

    console.log(`\n🚀 Starting FULL SYNC for: ${tableName}`);

    // 1. Fetch from Supabase
    const { data: rows, error } = await supabase.from(tableName).select('*');
    if (error) {
        console.error(`Error fetching ${tableName}:`, error.message);
        return;
    }
    console.log(`Found ${rows.length} rows in Supabase.`);

    for (const row of rows) {
        try {
            const rowId = row.id.toString();

            // 2. Determine Properties
            const properties = {
                'Supabase_ID': { rich_text: [{ text: { content: rowId } }] }
            };

            // Title logic
            const titleValue = row.nombre || row.nombre_es || row.titulo || row.title || row.id;
            const titlePropName = tableName === 'sesiones' ? 'Edición' : (tableName === 'mensajes_contacto' ? 'Asunto' : 'Name');
            properties[titlePropName] = { title: [{ text: { content: titleValue.toString() } }] };

            // Other props (simplified for this force sync)
            if (row.email) properties['Email'] = { email: row.email };
            if (row.telefono) properties['Teléfono'] = { rich_text: [{ text: { content: row.telefono.toString() } }] };
            if (row.capacidad) properties['Capacidad'] = { number: Number(row.capacidad) };

            // 3. Find existing page or create new
            let queryResults;
            try {
                const response = await notion.request({
                    path: `databases/${dbId}/query`,
                    method: 'POST',
                    body: {
                        filter: {
                            property: 'Supabase_ID',
                            rich_text: { equals: rowId }
                        }
                    }
                });
                queryResults = response.results;
            } catch (queryErr) {
                // Fallback to searching if request fails
                console.error(`\nQuery failed for ${rowId}:`, queryErr.message);
                queryResults = [];
            }

            if (queryResults && queryResults.length > 0) {
                await notion.pages.update({ page_id: queryResults[0].id, properties });
                process.stdout.write('.');
            } else {
                await notion.pages.create({ parent: { database_id: dbId }, properties });
                process.stdout.write('+');
            }

            await new Promise(r => setTimeout(r, 100)); // Avoid rate limits
        } catch (e) {
            console.error(`\nError syncing row ${row.id}:`, e.message);
        }
    }
    console.log(`\n✅ ${tableName} Sync Finished.`);
}

async function run() {
    console.log("Starting Master Historical Sync...");
    for (const table of TARGET_TABLES) {
        await syncTable(table);
    }
    console.log("\n✨ ALL TABLES SYNCED TO NOTION.");
}

run();
