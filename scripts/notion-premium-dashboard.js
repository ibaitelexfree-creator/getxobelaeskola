
const fs = require('fs');
require('dotenv').config({ path: '.env' });

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const PAGE_ID = '30c31210-b1a1-81c3-ab5c-d1817d6a0c03';
const MAP_FILE = 'scripts/table_to_notion_map.json';

// Define expected databases and their schemas (simplified for creation)
const REQUIRED_DBS = {
    inscripciones: { title: "DB: inscripciones 🗃️", icon: "📝" },
    reservas_alquiler: { title: "DB: reservas_alquiler 🗃️", icon: "🚤" },
    newsletter_subscriptions: { title: "DB: newsletter_subscriptions 🗃️", icon: "📧" },
    embarcaciones: { title: "DB: embarcaciones 🗃️", icon: "⛵" },
    sesiones: { title: "Sesiones (Calendario)", icon: "📅" },
    audit_logs: { title: "DB: audit_logs 🗃️", icon: "📡" },
    cursos: { title: "Academia (Cursos)", icon: "📚" },
    ediciones_curso: { title: "DB: ediciones_curso 🗃️", icon: "🗓️" },
    profiles: { title: "DB: profiles 🗃️", icon: "👥" }
};

async function checkPageStatus() {
    try {
        const res = await fetch(`https://api.notion.com/v1/pages/${PAGE_ID}`, {
            headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28' }
        });
        const page = await res.json();
        if (page.archived || page.in_trash || page.object === 'error') {
            console.error('❌ Current Dashboard Page is ARCHIVED, TRASHED, or INVALID.');
            console.log('🔍 Searching broadly for ANY valid parent page to rebuild...');

            // Search for ANY page we have access to
            const searchRes = await fetch('https://api.notion.com/v1/search', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filter: { value: 'page', property: 'object' },
                    sort: { direction: 'descending', timestamp: 'last_edited_time' }
                })
            });
            const searchData = await searchRes.json();
            const candidates = searchData.results?.filter(p => !p.archived && !p.in_trash) || [];

            // Smart Selection Strategy
            let validPage = candidates.find(p => {
                const title = p.properties?.title?.title?.[0]?.plain_text?.toLowerCase() || '';
                return title.includes('getxo') || title.includes('bela') || title.includes('eskola');
            });

            if (!validPage) validPage = candidates.find(p => {
                const title = p.properties?.title?.title?.[0]?.plain_text?.toLowerCase() || '';
                return title.includes('dashboard') || title.includes('panel') || title.includes('home');
            });

            if (!validPage) {
                // Fallback: Check for 'Untitled' pages if no branded pages found
                validPage = candidates.find(p => {
                    const title = p.properties?.title?.title?.[0]?.plain_text || 'Untitled';
                    return title === 'Untitled';
                });
                if (validPage) console.log('⚠️  No branded pages found. Using an "Untitled" page as fallback parent.');
            }

            if (!validPage && candidates.length > 0) {
                validPage = candidates[0]; // Desperation fallback
                console.log('⚠️  Using the first available page as fallback.');
            }

            if (validPage) {
                const parentTitle = validPage.properties?.title?.title?.[0]?.plain_text || 'Untitled';
                console.log(`✅ Found valid parent page: "${parentTitle}" (${validPage.id})`);
                console.log('🆕 Creating NEW "Centro de Mando" Dashboard under this parent...');

                const createRes = await fetch('https://api.notion.com/v1/pages', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        parent: { page_id: validPage.id },
                        icon: { type: "emoji", emoji: "🧭" },
                        cover: { external: { url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1" } },
                        properties: {
                            title: [{ text: { content: "Centro de Mando ⚓ - Operaciones (Restored)" } }]
                        }
                    })
                });
                const newPage = await createRes.json();
                if (newPage.id) {
                    PAGE_ID = newPage.id;
                    console.log(`✅ NEW Dashboard Page Created: ${PAGE_ID}`);
                    console.log(`👉 You can find it inside "${parentTitle}" in Notion.`);
                    return true;
                }
            } else {
                console.error('\n❌ FATAL: NO ACCESSIBLE PAGES FOUND IN NOTION.');
                console.error('👉 Please go to Notion, open a page (e.g. "Getxo Home"), click the "..." menu, select "Add connections", and add this integration.');
                return false;
            }
        }
        return true;
    } catch (e) {
        console.error('Error checking page status:', e);
        return false;
    }
}

async function getOrUpdateMap() {
    let map = {};
    try {
        if (fs.existsSync(MAP_FILE)) {
            map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
        }
    } catch (e) {
        console.error("Error reading map file:", e);
    }

    let updated = false;

    // console.log("🔍 Verifying Notion Databases...");

    for (const [key, config] of Object.entries(REQUIRED_DBS)) {
        let dbId = map[key];
        let isValid = false;

        // 1. Verify existence AND active status if ID is present
        if (dbId) {
            try {
                const res = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
                    headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28' }
                });
                const db = await res.json();
                if (res.ok && !db.archived && !db.in_trash) isValid = true;
                else if (db.archived) console.log(`⚠️ Database '${key}' is ARCHIVED. Will recreate.`);
            } catch (e) { /* ignore */ }
        }

        if (!isValid) {
            // console.log(`⚠️ Database for '${key}' missing or invalid. Searching...`);
            // 2. Search by title
            try {
                const searchRes = await fetch('https://api.notion.com/v1/search', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: config.title,
                        filter: { value: 'database', property: 'object' }
                    })
                });
                const searchData = await searchRes.json();
                const found = searchData.results?.find(db =>
                    (db.title[0]?.plain_text.includes(config.title) || db.title[0]?.plain_text === config.title)
                    && !db.archived && !db.in_trash
                );

                if (found) {
                    // console.log(`✅ Found existing database for '${key}': ${found.id}`);
                    map[key] = found.id;
                    updated = true;
                } else {
                    console.log(`🆕 Creating new database for '${key}'...`);
                    // 3. Create if not found
                    const createRes = await fetch('https://api.notion.com/v1/databases', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            parent: { page_id: PAGE_ID },
                            title: [{ type: "text", text: { content: config.title } }],
                            icon: { type: "emoji", emoji: config.icon },
                            properties: {
                                Name: { title: {} }, // Minimal schema, will be synced later
                                Supabase_ID: { rich_text: {} }
                            }
                        })
                    });
                    const createdDb = await createRes.json();
                    if (createdDb.id) {
                        console.log(`✅ Created database for '${key}': ${createdDb.id}`);
                        map[key] = createdDb.id;
                        updated = true;
                    } else {
                        console.error(`❌ Failed to create database for '${key}':`, createdDb);
                    }
                }
            } catch (e) {
                console.error(`Error resolving database '${key}':`, e);
            }
        } else {
            // console.log(`✅ Verified '${key}'`);
        }
    }

    if (updated) {
        console.log("💾 Updating table_to_notion_map.json...");
        fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 4));
    }

    return map;
}


async function fetchStats() {
    console.log('🚀 Fetching Admiral Intelligence from Supabase...');
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const firstOfMonth = today.slice(0, 7) + '-01';
    const firstOfYear = today.slice(0, 4) + '-01-01';

    const headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` };

    // 1. Core Data
    const [revToday, revMonth, revYear, students, socios, staff, boats, subscribersRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/reservas_alquiler?select=monto_total&fecha_pago=gte.${today}`, { headers }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/reservas_alquiler?select=monto_total&fecha_pago=gte.${firstOfMonth}`, { headers }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/reservas_alquiler?select=monto_total&fecha_pago=gte.${firstOfYear}`, { headers }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&rol=eq.alumno`, { headers }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&rol=eq.socio`, { headers }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&rol=in.("admin","instructor")`, { headers }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/embarcaciones?select=nombre,estado`, { headers }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/newsletter_subscriptions?select=id`, { headers }).then(r => r.json())
    ]).catch(err => { console.error('Fetch Error:', err); return [[], [], [], [], [], [], [], []]; });

    const sumMonto = (arr) => Array.isArray(arr) ? arr.reduce((acc, curr) => acc + (Number(curr.monto_total) || 0), 0) : 0;

    // 2. Audit Logs
    const auditLogsRes = await fetch(`${SUPABASE_URL}/rest/v1/audit_logs?select=action_type,description,created_at,staff_id&limit=8&order=created_at.desc`, { headers });
    const rawAuditLogs = await auditLogsRes.json();
    const auditLogs = Array.isArray(rawAuditLogs) ? await Promise.all(rawAuditLogs.map(async log => {
        try {
            const operator = (await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=nombre&id=eq.${log.staff_id}`, { headers }).then(r => r.json()))[0];
            return { action: log.action_type, desc: log.description, time: new Date(log.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), operator: operator?.nombre || 'Sistemas' };
        } catch { return { action: log.action_type, desc: log.description, time: '...', operator: 'System' }; }
    })) : [];

    // 3. Rentals Radar (The Detail)
    const recentRentalsRes = await fetch(`${SUPABASE_URL}/rest/v1/reservas_alquiler?select=id,monto_total,perfil_id,servicio_id,estado_entrega,fecha_reserva,hora_inicio&limit=10&order=created_at.desc`, { headers });
    const rawRentals = await recentRentalsRes.json();
    const recentRentals = Array.isArray(rawRentals) ? await Promise.all(rawRentals.map(async r => {
        try {
            const p = (await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=nombre,apellidos&id=eq.${r.perfil_id}`, { headers }).then(r => r.json()))[0];
            const s = (await fetch(`${SUPABASE_URL}/rest/v1/servicios_alquiler?select=nombre_es&id=eq.${r.servicio_id}`, { headers }).then(r => r.json()))[0];
            return {
                customer: `${p?.nombre || ''} ${p?.apellidos || ''}`.trim(),
                amount: r.monto_total,
                service: s?.nombre_es,
                status: r.estado_entrega,
                time: r.hora_inicio || '00:00'
            };
        } catch { return null; }
    })) : [];

    return {
        revenue: { today: sumMonto(revToday), month: sumMonto(revMonth), year: sumMonto(revYear) },
        counts: {
            students: students.length,
            socios: socios.length,
            staff: staff.length,
            boats: boats.length,
            subs: (subscribersRes || []).length,
            rentals_pending: (rawRentals || []).filter(r => r.estado_entrega === 'pendiente').length
        },
        auditLogs,
        recentRentals: recentRentals.filter(Boolean),
        boats
    };
}

async function clearDashboard() {
    process.stdout.write('🧹 Cleaning Admiral Dashboard...');
    try {
        const res = await fetch(`https://api.notion.com/v1/blocks/${PAGE_ID}/children`, {
            headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28' }
        });
        const data = await res.json();
        const blocks = data.results || [];
        for (const block of blocks) {
            process.stdout.write('.');
            await fetch(`https://api.notion.com/v1/blocks/${block.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28' }
            });
            await new Promise(r => setTimeout(r, 350));
        }
    } catch (err) { console.error('Clear failed:', err); }
    console.log('\n✨ Clear Complete.');
}

async function buildDashboard(stats, tableMap) {
    console.log('🏗️  Deploying Platinum Mirror UI...');

    const rt = (content, bold = false, color = 'default', link = null) => ({
        type: 'text', text: { content: String(content ?? ''), link: link ? { url: link } : null },
        annotations: { bold: !!bold, color: color || 'default' }
    });

    const shortcuts = (label, dbId) => {
        const url = dbId ? `https://www.notion.so/${dbId.replace(/-/g, '')}` : null;
        return rt(`${label} ➔\n`, true, 'blue', url);
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'entregado': return { emoji: '🌊', text: 'EN AGUA', color: 'blue' };
            case 'devuelto': return { emoji: '✅', text: 'FINALIZADO', color: 'green' };
            default: return { emoji: '⏳', text: 'PENDIENTE', color: 'orange' };
        }
    };

    const blocks = [
        { object: 'block', type: 'heading_1', heading_1: { rich_text: [rt('⚓ GESTIÓN INTEGRAL: GETXO BELA ESKOLA')] } },
        {
            object: 'block', type: 'paragraph', paragraph: {
                rich_text: [
                    rt('Espejo en tiempo real del Panel Administrativo Web. '),
                    rt('Supabase Analytics Engine Active.', true, 'green'),
                    rt(`\nÚltima sincronización: ${new Date().toLocaleString('es-ES')}`, false, 'gray')
                ]
            }
        },
        { object: 'block', type: 'divider', divider: {} },

        // TIER 1: FINANCIALS
        { object: 'block', type: 'heading_2', heading_2: { rich_text: [rt('💰 INTELIGENCIA FINANCIERA')] } },
        {
            object: 'block', type: 'column_list', column_list: {
                children: [
                    { object: 'block', type: 'column', column: { children: [{ object: 'block', type: 'callout', callout: { rich_text: [rt('HOY\n', true), rt(`${stats.revenue.today} €`)], icon: { type: 'emoji', emoji: '💸' }, color: 'blue_background' } }] } },
                    { object: 'block', type: 'column', column: { children: [{ object: 'block', type: 'callout', callout: { rich_text: [rt('ESTE MES\n', true), rt(`${stats.revenue.month} €`)], icon: { type: 'emoji', emoji: '📊' }, color: 'green_background' } }] } },
                    { object: 'block', type: 'column', column: { children: [{ object: 'block', type: 'callout', callout: { rich_text: [rt('ESTE AÑO\n', true), rt(`${stats.revenue.year} €`)], icon: { type: 'emoji', emoji: '🏦' }, color: 'purple_background' } }] } }
                ]
            }
        },

        // TIER 2: RENTALS
        { object: 'block', type: 'heading_2', heading_2: { rich_text: [rt('🚤 CONTROL DE ALQUILERES (Salidas)')] } },
        {
            object: 'block', type: 'column_list', column_list: {
                children: [
                    {
                        object: 'block', type: 'column', column: {
                            children: [
                                { object: 'block', type: 'paragraph', paragraph: { rich_text: [rt('Últimas 10 operaciones de flota:', true)] } },
                                ...stats.recentRentals.map(r => {
                                    const st = getStatusInfo(r.status);
                                    return {
                                        object: 'block', type: 'bulleted_list_item', bulleted_list_item: {
                                            rich_text: [
                                                rt(`${st.emoji} `, false),
                                                rt(`[${r.time}] `, false, 'gray'),
                                                rt(`${r.customer}: `, true),
                                                rt(`${r.service} `),
                                                rt(`(${st.text})`, true, st.color)
                                            ]
                                        }
                                    };
                                })
                            ]
                        }
                    },
                    {
                        object: 'block', type: 'column', column: {
                            children: [
                                { object: 'block', type: 'callout', callout: { rich_text: [rt('Alertas de Salida:\n', true), rt(`${stats.counts.rentals_pending} pendientes de entrega.`, false, stats.counts.rentals_pending > 0 ? 'orange' : 'default')], icon: { type: 'emoji', emoji: '🚨' } } },
                                { object: 'block', type: 'callout', callout: { rich_text: [rt('Estado de Suscriptores: ', true), rt(`${stats.counts.subs} 📬`)], icon: { type: 'emoji', emoji: '📧' } } }
                            ]
                        }
                    }
                ]
            }
        },

        // TIER 3: AUDIT LOGS
        { object: 'block', type: 'heading_2', heading_2: { rich_text: [rt('📡 RADAR DE OPERACIONES (Audit Log)')] } },
        {
            object: 'block', type: 'column_list', column_list: {
                children: [
                    {
                        object: 'block', type: 'column', column: {
                            children: [
                                ...stats.auditLogs.map(log => ({
                                    object: 'block', type: 'bulleted_list_item', bulleted_list_item: {
                                        rich_text: [
                                            rt(`[${log.time}] `, false, 'gray'),
                                            rt(`${log.operator}: `, true, 'blue'),
                                            rt(`${log.desc} `),
                                            rt(`(${log.action})`, false, 'orange')
                                        ]
                                    }
                                }))
                            ]
                        }
                    },
                    {
                        object: 'block', type: 'column', column: {
                            children: [
                                { object: 'block', type: 'callout', callout: { rich_text: [rt('Academia Activa: ', true), rt(`${stats.counts.students} alumn.`)], icon: { type: 'emoji', emoji: '📜' }, color: 'gray_background' } },
                                { object: 'block', type: 'callout', callout: { rich_text: [rt('Flota Lista: ', true), rt(`${stats.boats.filter(b => b.estado === 'listo').length}`)], icon: { type: 'emoji', emoji: '⛵' }, color: 'blue_background' } }
                            ]
                        }
                    }
                ]
            }
        },

        // TIER 4: MASTER DATABASE ECOSYSTEM
        { object: 'block', type: 'divider', divider: {} },
        { object: 'block', type: 'heading_2', heading_2: { rich_text: [rt('🌍 ECOSISTEMA DE DATOS (Master Access)')] } },
        {
            object: 'block', type: 'column_list', column_list: {
                children: [
                    { object: 'block', type: 'column', column: { children: [{ object: 'block', type: 'callout', callout: { rich_text: [rt('🏢 CRM & VENTAS\n', true), shortcuts('Inscripciones', tableMap.inscripciones), shortcuts('Reservas Alquiler', tableMap.reservas_alquiler || ''), shortcuts('Newsletter', tableMap.newsletter_subscriptions)], icon: { type: 'emoji', emoji: '🏬' }, color: 'orange_background' } }] } },
                    { object: 'block', type: 'column', column: { children: [{ object: 'block', type: 'callout', callout: { rich_text: [rt('⚓ OPERACIONES\n', true), shortcuts('Flota', tableMap.embarcaciones), shortcuts('Escuela Sesiones', tableMap.sesiones), shortcuts('Logs Auditoría', tableMap.audit_logs)], icon: { type: 'emoji', emoji: '⚙️' }, color: 'blue_background' } }] } },
                    { object: 'block', type: 'column', column: { children: [{ object: 'block', type: 'callout', callout: { rich_text: [rt('🎓 ACADEMIA\n', true), shortcuts('Cursos', tableMap.cursos), shortcuts('Ediciones', tableMap.ediciones_curso), shortcuts('Perfiles Master', tableMap.profiles)], icon: { type: 'emoji', emoji: '📚' }, color: 'green_background' } }] } }
                ]
            }
        }
    ];

    const chunkSize = 50;
    for (let i = 0; i < blocks.length; i += chunkSize) {
        const chunk = blocks.slice(i, i + chunkSize);
        const res = await fetch(`https://api.notion.com/v1/blocks/${PAGE_ID}/children`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
            body: JSON.stringify({ children: chunk })
        });
        if (!res.ok) console.error('Build Error:', await res.json());
        await new Promise(r => setTimeout(r, 450));
    }
}

async function run() {
    try {
        const isOk = await checkPageStatus();
        if (!isOk) {
            console.error("❌ ABORTING: Script exiting because no valid Notion page was found to build the dashboard.");
            process.exit(1);
        }

        const tableMap = await getOrUpdateMap();
        const stats = await fetchStats();

        await clearDashboard();
        await buildDashboard(stats, tableMap);

        console.log('✅ Platinum Admiral Dashboard Redeployed Successfully!');
    } catch (err) {
        console.error('Run failed:', err.message);
        process.exit(1);
    }
}

run();
