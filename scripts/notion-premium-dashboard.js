
const fs = require('fs');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const PAGE_ID = '30c31210b1a1815f9dbaf547ca68b195';
const TABLE_MAP = JSON.parse(fs.readFileSync('scripts/table_to_notion_map.json', 'utf8'));
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1x6JyHCHRpBNbnrFHPDvzvV01ukiwVCUD';

// HELPER: Google Auth for Drive
const { google } = require('googleapis');
const driveAuth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
});
const drive = google.drive({ version: 'v3', auth: driveAuth });

async function listDriveFiles() {
    try {
        const res = await drive.files.list({
            q: `'${DRIVE_FOLDER_ID}' in parents and trashed = false`,
            fields: 'files(id, name, webViewLink, modifiedTime)',
            orderBy: 'modifiedTime desc',
            pageSize: 5
        });
        return res.data.files || [];
    } catch (e) {
        console.warn('⚠️ Google Drive access skipped (check service account permissions).');
        return [];
    }
}

async function fetchStats() {
    console.log('Fetching comprehensive stats from Supabase...');
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const firstOfMonth = today.slice(0, 7) + '-01';
    const firstOfYear = today.slice(0, 4) + '-01-01';

    const headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` };

    // 1. Revenue Stats (Rentals + Inscriptions)
    const [revToday, revMonth, revYear] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/reservas_alquiler?select=monto_total&fecha_pago=gte.${today}`, { headers }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/reservas_alquiler?select=monto_total&fecha_pago=gte.${firstOfMonth}`, { headers }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/reservas_alquiler?select=monto_total&fecha_pago=gte.${firstOfYear}`, { headers }).then(r => r.json())
    ]).catch(err => { console.error('Revenue Fetch Error:', err); return [[], [], []]; });

    const sumMonto = (arr) => Array.isArray(arr) ? arr.reduce((acc, curr) => acc + (Number(curr.monto_total) || 0), 0) : 0;

    // 2. Population Stats
    const [students, socios, staff, boats] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&rol=eq.alumno`, { headers }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&rol=eq.socio`, { headers }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id&rol=in.("admin","instructor")`, { headers }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/embarcaciones?select=nombre,estado`, { headers }).then(r => r.json())
    ]).catch(err => { console.error('Pop Stats Error:', err); return [[], [], [], []]; });

    // 3. Recent Sales (Inscripciones)
    const resRecentInsc = await fetch(`${SUPABASE_URL}/rest/v1/inscripciones?select=monto_total,perfil_id,curso_id&limit=5&order=created_at.desc`, { headers });
    const rawSales = await resRecentInsc.json();
    const recentSales = Array.isArray(rawSales) ? await Promise.all(rawSales.map(async s => {
        try {
            const p = (await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=nombre,apellidos&id=eq.${s.perfil_id}`, { headers }).then(r => r.json()))[0];
            const c = (await fetch(`${SUPABASE_URL}/rest/v1/cursos?select=nombre&id=eq.${s.curso_id}`, { headers }).then(r => r.json()))[0];
            return { customer: `${p?.nombre || ''} ${p?.apellidos || ''}`.trim() || 'Desconocido', amount: s.monto_total || 0, course: c?.nombre || 'Curso' };
        } catch { return { customer: 'Error', amount: 0, course: 'Error' }; }
    })) : [];

    // 4. Recent Rentals
    const resRecentRentals = await fetch(`${SUPABASE_URL}/rest/v1/reservas_alquiler?select=monto_total,perfil_id,servicio_id&limit=5&order=created_at.desc`, { headers });
    const rawRentals = await resRecentRentals.json();
    const recentRentals = Array.isArray(rawRentals) ? await Promise.all(rawRentals.map(async r => {
        try {
            const p = (await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=nombre,apellidos&id=eq.${r.perfil_id}`, { headers }).then(r => r.json()))[0];
            const s = (await fetch(`${SUPABASE_URL}/rest/v1/servicios_alquiler?select=nombre_es&id=eq.${r.servicio_id}`, { headers }).then(r => r.json()))[0];
            return { customer: `${p?.nombre || ''} ${p?.apellidos || ''}`.trim() || 'Navegante', amount: r.monto_total || 0, service: s?.nombre_es || 'Equipo' };
        } catch { return { customer: 'Error', amount: 0, service: 'Error' }; }
    })) : [];

    // 5. Active Courses
    const resEdiciones = await fetch(`${SUPABASE_URL}/rest/v1/ediciones_curso?select=plazas_totales,plazas_ocupadas,curso_id&limit=3&order=fecha_inicio.asc`, { headers });
    const rawEdiciones = await resEdiciones.json();
    const activeCourses = Array.isArray(rawEdiciones) ? await Promise.all(rawEdiciones.map(async e => {
        try {
            const c = (await fetch(`${SUPABASE_URL}/rest/v1/cursos?select=nombre&id=eq.${e.curso_id}`, { headers }).then(r => r.json()))[0];
            return { name: c?.nombre || 'Curso', occupancy: Math.round((e.plazas_ocupadas / e.plazas_totales) * 100) || 0 };
        } catch { return { name: 'Error', occupancy: 0 }; }
    })) : [];

    // 6. Upcoming Sessions
    const resSessions = await fetch(`${SUPABASE_URL}/rest/v1/sesiones?select=fecha,hora_inicio,instructor_id&fecha=gte.${today}&limit=5&order=fecha.asc,hora_inicio.asc`, { headers });
    const rawSessions = await resSessions.json();
    const upcomingSessions = Array.isArray(rawSessions) ? await Promise.all(rawSessions.map(async s => {
        try {
            const inst = (await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=nombre&id=eq.${s.instructor_id}`, { headers }).then(r => r.json()))[0];
            return { date: s.fecha, time: s.hora_inicio, instructor: inst?.nombre || 'Instructor' };
        } catch { return { date: s.fecha, time: s.hora_inicio, instructor: 'Error' }; }
    })) : [];

    // 7. Recent CRM (Messages)
    const resMessages = await fetch(`${SUPABASE_URL}/rest/v1/mensajes_contacto?select=nombre,asunto,created_at&limit=3&order=created_at.desc`, { headers });
    const recentMessages = (await resMessages.json()) || [];

    // 8. Communication
    const subscribersRes = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_subscriptions?select=id`, { headers }).then(r => r.json());
    const subscribers = Array.isArray(subscribersRes) ? subscribersRes.length : 0;

    const stats = {
        revenue: { today: sumMonto(revToday), month: sumMonto(revMonth), year: sumMonto(revYear) },
        counts: { students: students.length, socios: socios.length, staff: staff.length, boats: boats.length },
        boats,
        recentSales,
        recentRentals,
        activeCourses,
        upcomingSessions,
        recentMessages,
        subscribers,
        driveFiles: await listDriveFiles()
    };
    console.log('Stats summary:', JSON.stringify({ revenue: stats.revenue, counts: stats.counts }, null, 2));
    return stats;
}

async function clearDashboard() {
    console.log('Clearing old dashboard blocks...');
    if (!NOTION_TOKEN) {
        console.error('NOTION_TOKEN is missing!');
        return;
    }
    try {
        const res = await fetch(`https://api.notion.com/v1/blocks/${PAGE_ID}/children`, {
            headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28' }
        });
        if (!res.ok) {
            console.error('Failed to fetch children:', await res.json());
            return;
        }
        const data = await res.json();
        const blocks = data.results || [];
        console.log(`Found ${blocks.length} blocks to clear.`);

        for (const block of blocks) {
            process.stdout.write('.');
            await fetch(`https://api.notion.com/v1/blocks/${block.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28' }
            });
            await new Promise(r => setTimeout(r, 350)); // Respect Rate Limits
        }
        console.log('\nClear finished.');
    } catch (err) {
        console.error('Clear failed:', err);
    }
}

async function buildDashboard(stats) {
    console.log('Building Advanced Admin Dashboard...');

    // HELPER: Create standard Rich Text Object with robust nesting
    const rt = (content, bold = false, color = 'default', link = null) => {
        const obj = {
            type: 'text',
            text: { content: String(content ?? '') },
            annotations: {
                bold: !!bold,
                color: color || 'default'
            }
        };
        if (link) obj.text.link = { url: link };
        return obj;
    };

    const shortcuts = (label, dbId) => rt(`${label} ➔\n`, true, 'blue', `https://www.notion.so/${dbId.replace(/-/g, '')}`);

    const blocks = [
        { object: 'block', type: 'heading_1', heading_1: { rich_text: [rt('⚓ CENTRO DE MANDO: GETXO BELA ESKOLA')] } },
        {
            object: 'block', type: 'paragraph', paragraph: {
                rich_text: [
                    rt('Control Operativo & Business Intelligence sincronizado con '),
                    rt('Supabase Cloud', true, 'blue'),
                    rt(`. Último pulso: ${new Date().toLocaleString('es-ES')}`, false, 'gray')
                ]
            }
        },
        { object: 'block', type: 'divider', divider: {} },

        // 1. REVENUE CARDS
        {
            object: 'block', type: 'column_list', column_list: {
                children: [
                    { object: 'block', type: 'column', column: { children: [{ object: 'block', type: 'callout', callout: { rich_text: [rt('VENTAS HOY\n', true), rt(`${stats.revenue.today} €`)], icon: { type: 'emoji', emoji: '☀️' }, color: 'blue_background' } }] } },
                    { object: 'block', type: 'column', column: { children: [{ object: 'block', type: 'callout', callout: { rich_text: [rt('ESTE MES\n', true), rt(`${stats.revenue.month} €`)], icon: { type: 'emoji', emoji: '📅' }, color: 'green_background' } }] } },
                    { object: 'block', type: 'column', column: { children: [{ object: 'block', type: 'callout', callout: { rich_text: [rt('BENEFICIO AÑO\n', true), rt(`${stats.revenue.year} €`)], icon: { type: 'emoji', emoji: '💰' }, color: 'purple_background' } }] } }
                ]
            }
        },

        // 2. KPI QUICK VIEW
        {
            object: 'block', type: 'column_list', column_list: {
                children: [
                    { object: 'block', type: 'column', column: { children: [{ object: 'block', type: 'callout', callout: { rich_text: [rt('Alumnos: ', true), rt(`${stats.counts.students}`)], icon: { type: 'emoji', emoji: '🎓' } } }] } },
                    { object: 'block', type: 'column', column: { children: [{ object: 'block', type: 'callout', callout: { rich_text: [rt('Socios: ', true), rt(`${stats.counts.socios}`)], icon: { type: 'emoji', emoji: '💎' } } }] } },
                    { object: 'block', type: 'column', column: { children: [{ object: 'block', type: 'callout', callout: { rich_text: [rt('Staff: ', true), rt(`${stats.counts.staff}`)], icon: { type: 'emoji', emoji: '🧑‍✈️' } } }] } },
                    { object: 'block', type: 'column', column: { children: [{ object: 'block', type: 'callout', callout: { rich_text: [rt('Flota: ', true), rt(`${stats.counts.boats}`)], icon: { type: 'emoji', emoji: '⛵' } } }] } }
                ]
            }
        },

        { object: 'block', type: 'divider', divider: {} },

        // 3. ACTION CENTER (MIRRORING ADMIN PANEL TABS)
        { object: 'block', type: 'heading_2', heading_2: { rich_text: [rt('⚡ ACCIONES DE GESTIÓN (Web)')] } },
        {
            object: 'block', type: 'column_list', column_list: {
                children: [
                    { object: 'block', type: 'column', column: { children: [{ object: 'block', type: 'callout', callout: { rich_text: [rt('Sincronizar Cloud 🔄', true, 'default', 'https://getxobelaeskola.vercel.app/api/admin/notion/sync')], icon: { type: 'emoji', emoji: '⚡' }, color: 'gray_background' } }] } },
                    { object: 'block', type: 'column', column: { children: [{ object: 'block', type: 'callout', callout: { rich_text: [rt('Control de Alquileres 🚤', true, 'default', 'https://getxobelaeskola.vercel.app/staff?tab=rentals')], icon: { type: 'emoji', emoji: '🚤' }, color: 'gray_background' } }] } },
                    { object: 'block', type: 'column', column: { children: [{ object: 'block', type: 'callout', callout: { rich_text: [rt('Gestión de Alumnos 🎓', true, 'default', 'https://getxobelaeskola.vercel.app/staff?tab=academic')], icon: { type: 'emoji', emoji: '🎓' }, color: 'gray_background' } }] } }
                ]
            }
        },

        { object: 'block', type: 'divider', divider: {} },

        // 4. SALES & RENTALS DASHBOARD
        {
            object: 'block', type: 'column_list', column_list: {
                children: [
                    {
                        object: 'block', type: 'column', column: {
                            children: [
                                { object: 'block', type: 'heading_2', heading_2: { rich_text: [rt('💳 Últimas Inscripciones')] } },
                                ...stats.recentSales.map(s => ({
                                    object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: [rt(`${s.customer}: `, true), rt(`${s.amount}€ (${s.course})`)] }
                                }))
                            ]
                        }
                    },
                    {
                        object: 'block', type: 'column', column: {
                            children: [
                                { object: 'block', type: 'heading_2', heading_2: { rich_text: [rt('🚤 Alquileres Recientes')] } },
                                ...stats.recentRentals.map(r => ({
                                    object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: [rt(`${r.customer}: `, true), rt(`${r.amount}€ (${r.service})`)] }
                                }))
                            ]
                        }
                    }
                ]
            }
        },

        { object: 'block', type: 'divider', divider: {} },

        // 5. CRM & COMMUNICATION
        {
            object: 'block', type: 'column_list', column_list: {
                children: [
                    {
                        object: 'block', type: 'column', column: {
                            children: [
                                { object: 'block', type: 'heading_2', heading_2: { rich_text: [rt('📧 Últimos Mensajes CRM')] } },
                                ...(Array.isArray(stats.recentMessages) ? stats.recentMessages : []).map(m => ({
                                    object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: [rt(`${m.nombre}: `, true), rt(`${m.asunto}`)] }
                                })),
                                { object: 'block', type: 'paragraph', paragraph: { rich_text: [rt('Total Suscriptores: ', true), rt(`${stats.subscribers} 📧`)] } }
                            ]
                        }
                    },
                    {
                        object: 'block', type: 'column', column: {
                            children: [
                                { object: 'block', type: 'heading_2', heading_2: { rich_text: [rt('📂 Documentos Drive (Recientes)')] } },
                                ...stats.driveFiles.map(f => ({
                                    object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: [rt(`${f.name}\n`, true, 'default', f.webViewLink), rt(new Date(f.modifiedTime).toLocaleDateString(), false, 'gray')] }
                                })),
                                { object: 'block', type: 'callout', callout: { rich_text: [rt('Total Alumnos: '), rt(`${stats.counts.students}`, true)], icon: { type: 'emoji', emoji: '🎓' }, color: 'blue_background' } }
                            ]
                        }
                    }
                ]
            }
        },

        { object: 'block', type: 'divider', divider: {} },

        // 6. FLEET INTELLIGENCE
        { object: 'block', type: 'heading_2', heading_2: { rich_text: [rt('⚓ ESTADO DE LA FLOTA')] } },
        {
            object: 'block', type: 'column_list', column_list: {
                children: [
                    {
                        object: 'block', type: 'column', column: {
                            children: [
                                { object: 'block', type: 'callout', callout: { rich_text: [rt('Listos para navegar: '), rt(`${stats.boats.filter(b => b.estado === 'listo').length}`, true)], icon: { type: 'emoji', emoji: '⛵' }, color: 'blue_background' } }
                            ]
                        }
                    },
                    {
                        object: 'block', type: 'column', column: {
                            children: [
                                { object: 'block', type: 'callout', callout: { rich_text: [rt('Mantenimiento / Avería: '), rt(`${stats.boats.filter(b => b.estado !== 'listo').length}`, true)], icon: { type: 'emoji', emoji: '🛠️' }, color: 'yellow_background' } }
                            ]
                        }
                    }
                ]
            }
        },
        ...(stats.boats.filter(b => b.estado !== 'listo').length > 0 ? [
            { object: 'block', type: 'paragraph', paragraph: { rich_text: [rt('ATENCIÓN: Barcos fuera de servicio:', true, 'red')] } },
            ...stats.boats.filter(b => b.estado !== 'listo').map(b => ({
                object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: [rt(`${b.nombre} — `), rt(`${b.estado}`, true, 'red')] }
            }))
        ] : []),

        { object: 'block', type: 'divider', divider: {} },

        // 7. FULL DATABASE ECOSYSTEM
        { object: 'block', type: 'heading_2', heading_2: { rich_text: [rt('📊 ECOSISTEMA DE DATOS (Notion Databases)')] } },
        {
            object: 'block', type: 'column_list', column_list: {
                children: [
                    {
                        object: 'block', type: 'column', column: {
                            children: [{
                                object: 'block', type: 'callout', callout: {
                                    rich_text: [
                                        rt('🏢 COMERCIAL & CRM\n', true),
                                        shortcuts('Mensajes Contacto', TABLE_MAP.mensajes_contacto),
                                        shortcuts('Inscripciones', TABLE_MAP.inscripciones),
                                        shortcuts('Reservas Alquiler', TABLE_MAP.reservas_alquiler || ''),
                                        shortcuts('Newsletter Subs', TABLE_MAP.newsletter_subscriptions)
                                    ], icon: { type: 'emoji', emoji: '💎' }, color: 'blue_background'
                                }
                            }]
                        }
                    },
                    {
                        object: 'block', type: 'column', column: {
                            children: [{
                                object: 'block', type: 'callout', callout: {
                                    rich_text: [
                                        rt('⚓ OPERACIONES\n', true),
                                        shortcuts('Embarcaciones', TABLE_MAP.embarcaciones),
                                        shortcuts('Sesiones Escuela', TABLE_MAP.sesiones),
                                        shortcuts('Mantenimiento', TABLE_MAP.mantenimiento_logs),
                                        shortcuts('Auditoría', TABLE_MAP.audit_logs)
                                    ], icon: { type: 'emoji', emoji: '⚙️' }, color: 'orange_background'
                                }
                            }]
                        }
                    },
                    {
                        object: 'block', type: 'column', column: {
                            children: [{
                                object: 'block', type: 'callout', callout: {
                                    rich_text: [
                                        rt('🎓 ACADEMIA\n', true),
                                        shortcuts('Cursos & Nivel', TABLE_MAP.cursos),
                                        shortcuts('Ediciones', TABLE_MAP.ediciones_curso),
                                        shortcuts('Perfiles (Master)', TABLE_MAP.profiles),
                                        shortcuts('Habilidades', TABLE_MAP.habilidades)
                                    ], icon: { type: 'emoji', emoji: '📚' }, color: 'green_background'
                                }
                            }]
                        }
                    }
                ]
            }
        }
    ];

    console.log(`Appending ${blocks.length} blocks to Notion in chunks...`);
    const chunkSize = 50;
    for (let i = 0; i < blocks.length; i += chunkSize) {
        const chunk = blocks.slice(i, i + chunkSize);
        console.log(`Sending chunk ${i / chunkSize + 1}...`);
        const res = await fetch(`https://api.notion.com/v1/blocks/${PAGE_ID}/children`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
            body: JSON.stringify({ children: chunk })
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error('CRITICAL: Dashboard Build Error:', JSON.stringify(errorData, null, 2));
            break;
        }
        await new Promise(r => setTimeout(r, 400));
    }
}

async function run() {
    try {
        const stats = await fetchStats();
        await clearDashboard();
        await buildDashboard(stats);
        console.log('✅ Premium Admin Dashboard successfully built in Notion!');
    } catch (err) {
        console.error('Run failed:', err);
    }
}

run();
