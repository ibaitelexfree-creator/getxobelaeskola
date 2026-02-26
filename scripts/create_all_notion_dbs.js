
const fs = require('fs');

<<<<<<< HEAD
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const PARENT_PAGE_ID = process.env.NOTION_PARENT_PAGE_ID || '30c31210-b1a1-8167-a0e1-d1bca669ae72';
=======
const NOTION_TOKEN = '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';
const PARENT_PAGE_ID = '30c31210-b1a1-8167-a0e1-d1bca669ae72';
>>>>>>> pr-286

const schema = JSON.parse(fs.readFileSync('supabase_schema.json', 'utf8'));

// Tables we ALREADY have manually created (to avoid duplicates or renaming them)
const ALREADY_CREATED = {
    'cursos': 'Academia',
    'embarcaciones': 'Flota',
    'instructores': 'Staff',
    'mensajes_contacto': 'CRM',
    'sesiones': 'Sesiones',
    'habilidades': 'Habilidades'
};

async function createNotionDB(tableName, definition) {
    if (ALREADY_CREATED[tableName]) return;

    console.log(`Creating Notion DB for table: ${tableName}`);

    const properties = {
        'Supabase_ID': { rich_text: {} }
    };

    // Determine the Title property
    let titleProp = 'ID';
    const cols = definition.properties;
    if (cols.nombre || cols.name) titleProp = cols.nombre ? 'nombre' : 'name';
    else if (cols.titulo || cols.title) titleProp = cols.titulo ? 'titulo' : 'title';
    else if (cols.email) titleProp = 'email';
    else if (cols.id) titleProp = 'id';

    properties['Title'] = { title: {} }; // We'll map the best column to 'Title'

    // Add other columns (simplified mapping)
    for (const [colName, colDef] of Object.entries(cols)) {
        if (colName === titleProp) continue; // Already handled by 'Title'
        if (colName === 'id') continue; // Handled by Supabase_ID

        if (colDef.type === 'integer' || colDef.type === 'number') {
            properties[colName] = { number: {} };
        } else if (colDef.type === 'boolean') {
            properties[colName] = { checkbox: {} };
        } else if (colDef.format === 'timestamp with time zone' || colDef.format === 'date') {
            properties[colName] = { date: {} };
        } else {
            properties[colName] = { rich_text: {} };
        }
    }

    const res = await fetch('https://api.notion.com/v1/databases', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${NOTION_TOKEN}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            parent: { type: 'page_id', page_id: PARENT_PAGE_ID },
            title: [{ type: 'text', text: { content: `DB: ${tableName} 🗃️` } }],
            properties: properties
        })
    });

    const data = await res.json();
    if (data.object === 'error') {
        console.error(`Error creating DB for ${tableName}:`, data);
    } else {
        console.log(`Successfully created DB for ${tableName}: ${data.id}`);
    }
}

async function run() {
    const tableKeys = Object.keys(schema.definitions);
    for (const tableName of tableKeys) {
        await createNotionDB(tableName, schema.definitions[tableName]);
        // Avoid rate limits
        await new Promise(r => setTimeout(r, 500));
    }
}

run().catch(console.error);
