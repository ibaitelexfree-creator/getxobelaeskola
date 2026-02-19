
const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xbledhifomblirxurtyv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NOTION_TOKEN = process.env.NOTION_TOKEN || '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';

const tableMap = JSON.parse(fs.readFileSync('scripts/table_to_notion_map.json', 'utf8'));
const schema = JSON.parse(fs.readFileSync('supabase_schema.json', 'utf8'));

async function sbFetch(table) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    return res.json();
}

async function sbUpdate(table, id, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
    });
    return res.ok;
}

async function notionQuery(dbId) {
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${NOTION_TOKEN}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        }
    });
    return res.json();
}

async function notionUpdate(pageId, props) {
    await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${NOTION_TOKEN}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ properties: props })
    });
}

async function notionCreate(dbId, props) {
    await fetch(`https://api.notion.com/v1/pages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${NOTION_TOKEN}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ parent: { database_id: dbId }, properties: props })
    });
}

function getBestTitleCol(table) {
    const cols = schema.definitions[table].properties;
    if (cols.nombre_es) return 'nombre_es';
    if (cols.nombre) return 'nombre';
    if (cols.name) return 'name';
    if (cols.titulo) return 'titulo';
    if (cols.title) return 'title';
    if (cols.asunto) return 'asunto';
    if (cols.email) return 'email';
    if (cols.edicion) return 'edicion';
    return 'id';
}

async function syncTable(sbTable, direction) {
    const dbId = tableMap[sbTable];
    if (!dbId) return;

    console.log(`\nSyncing ${sbTable} [${direction}]...`);

    const sbRows = await sbFetch(sbTable);
    if (!Array.isArray(sbRows)) {
        console.error(`Supabase fetch failed for ${sbTable}:`, sbRows);
        return;
    }
    console.log(`Supabase rows: ${sbRows.length}`);

    const nData = await notionQuery(dbId);
    const notionPages = nData.results || [];
    console.log(`Notion pages: ${notionPages.length}`);
    const index = {};
    notionPages.forEach(p => {
        const sid = p.properties['Supabase_ID']?.rich_text?.[0]?.plain_text;
        if (sid) index[sid] = p;
    });

    const titleCol = getBestTitleCol(sbTable);
    const propDefinitions = schema.definitions[sbTable].properties;

    if (direction === 'pull') {
        for (const row of sbRows) {
            const props = { 'Supabase_ID': { rich_text: [{ text: { content: row.id.toString() } }] } };

            // Map Title
            const titleVal = row[titleCol] || row.id;
            props['Title'] = { title: [{ text: { content: titleVal.toString() } }] };
            // Compatibility with old manually created DBs
            if (sbTable === 'cursos') props['Nombre'] = { title: [{ text: { content: titleVal.toString() } }] };
            if (sbTable === 'embarcaciones') props['Nombre'] = { title: [{ text: { content: titleVal.toString() } }] };
            if (sbTable === 'instructores') props['Nombre'] = { title: [{ text: { content: titleVal.toString() } }] };
            if (sbTable === 'habilidades') props['Nombre'] = { title: [{ text: { content: titleVal.toString() } }] };
            if (sbTable === 'sesiones') props['Edicion'] = { title: [{ text: { content: titleVal.toString() } }] };
            if (sbTable === 'mensajes_contacto') props['Asunto'] = { title: [{ text: { content: titleVal.toString() } }] };

            // Map other columns
            for (const colName of Object.keys(propDefinitions)) {
                if (colName === 'id' || colName === titleCol) continue;
                const val = row[colName];
                if (val === null || val === undefined) continue;

                // Simple type detection based on schema
                const def = propDefinitions[colName];
                if (def.type === 'integer' || def.type === 'number') {
                    props[colName] = { number: Number(val) };
                } else if (def.type === 'boolean') {
                    props[colName] = { checkbox: !!val };
                } else if (def.format === 'timestamp with time zone' || def.format === 'date') {
                    props[colName] = { date: { start: val.toString().split('T')[0] } };
                } else if (colName.includes('email')) {
                    props[colName] = { email: val.toString() };
                } else {
                    // Try to guess if it should be a select (not reliable yet, stick to rich_text)
                    props[colName] = { rich_text: [{ text: { content: val.toString().substring(0, 2000) } }] };
                }
            }

            if (index[row.id]) {
                await notionUpdate(index[row.id].id, props);
            } else {
                await notionCreate(dbId, props);
            }
        }
    } else {
        // PUSH logic: Notion -> Supabase
        console.log(`🔍 Checking for changes in Notion to push to ${sbTable}...`);
        for (const page of notionPages) {
            const sbId = page.properties['Supabase_ID']?.rich_text?.[0]?.plain_text;
            if (!sbId) continue;

            const updateData = {};
            let hasChanges = false;

            for (const [propName, propValue] of Object.entries(page.properties)) {
                if (propName === 'Supabase_ID' || propName === 'Title' || propName === 'Nombre' || propName === 'Edicion' || propName === 'Asunto') continue;

                // Only sync columns that exist in Supabase schema
                if (!propDefinitions[propName]) continue;

                let val;
                if (propValue.type === 'rich_text') val = propValue.rich_text?.[0]?.plain_text;
                else if (propValue.type === 'title') val = propValue.title?.[0]?.plain_text;
                else if (propValue.type === 'number') val = propValue.number;
                else if (propValue.type === 'checkbox') val = propValue.checkbox;
                else if (propValue.type === 'select') val = propValue.select?.name;
                else if (propValue.type === 'multi_select') val = propValue.multi_select?.map(x => x.name);
                else if (propValue.type === 'date') val = propValue.date?.start;
                else if (propValue.type === 'email') val = propValue.email;

                if (val !== undefined) {
                    updateData[propName] = val;
                    hasChanges = true;
                }
            }

            if (hasChanges) {
                console.log(`Updating Supabase row ${sbId}...`);
                const success = await sbUpdate(sbTable, sbId, updateData);
                if (!success) console.error(`Failed to update Supabase row ${sbId}`);
            }
        }
    }
}

async function run() {
    const direction = process.argv[2] || 'pull';
    const targetTable = process.argv[3];

    if (targetTable && tableMap[targetTable]) {
        await syncTable(targetTable, direction);
    } else {
        for (const sbTable of Object.keys(tableMap)) {
            await syncTable(sbTable, direction);
            await new Promise(r => setTimeout(r, 200));
        }
    }
}

run().catch(console.error);
