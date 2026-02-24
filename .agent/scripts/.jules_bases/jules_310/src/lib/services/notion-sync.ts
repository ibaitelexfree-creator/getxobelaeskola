
import { Client } from '@notionhq/client';
import { createAdminClient } from '@/lib/supabase/admin';
import fs from 'fs';
import path from 'path';

export class NotionSyncService {
    private notion: Client;
    private supabase = createAdminClient();
    private tableMap: Record<string, string>;
    private schema: any;

    private readonly DASHBOARD_PAGE_ID = '30c31210-b1a1-81c3-ab5c-d1817d6a0c03';
    private readonly FLEET_DB_ID = '30c31210-b1a1-813b-a949-d7ddf66d84c9';

    constructor() {
        this.notion = new Client({ auth: process.env.NOTION_TOKEN });

        try {
            const mapPath = path.join(process.cwd(), 'scripts', 'table_to_notion_map.json');
            const schemaPath = path.join(process.cwd(), 'supabase_schema.json');

            this.tableMap = fs.existsSync(mapPath) ? JSON.parse(fs.readFileSync(mapPath, 'utf8')) : {};
            this.schema = fs.existsSync(schemaPath) ? JSON.parse(fs.readFileSync(schemaPath, 'utf8')) : { definitions: {} };
        } catch (error) {
            console.error('Error initializing NotionSyncService:', error);
            this.tableMap = {};
            this.schema = { definitions: {} };
        }
    }

    private getBestTitleCol(table: string): string {
        const definitions = this.schema?.definitions || {};
        const cols = definitions[table]?.properties || {};
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

    async syncTable(sbTable: string, direction: 'pull' | 'push' = 'pull') {
        const dbId = this.tableMap[sbTable];
        if (!dbId) {
            throw new Error(`No Notion database mapping found for table: ${sbTable}`);
        }

        console.log(`\nSyncing ${sbTable} [${direction}]...`);

        // Fetch Supabase data
        const { data: sbRows, error: sbError } = await this.supabase.from(sbTable).select('*');
        if (sbError) {
            throw new Error(`Supabase fetch failed for ${sbTable}: ${sbError.message}`);
        }
        console.log(`Supabase rows: ${sbRows?.length || 0}`);

        // Fetch Notion data
        const nData = await this.notion.databases.query({ database_id: dbId });
        const notionPages = nData.results || [];
        console.log(`Notion pages: ${notionPages.length}`);

        const index: Record<string, any> = {};
        notionPages.forEach((p: any) => {
            const sid = p.properties['Supabase_ID']?.rich_text?.[0]?.plain_text;
            if (sid) index[sid] = p;
        });

        const titleCol = this.getBestTitleCol(sbTable);
        const propDefinitions = (this.schema?.definitions?.[sbTable]?.properties) || {};

        if (direction === 'pull') {
            for (const row of (sbRows as any[] || [])) {
                const props: any = {
                    'Supabase_ID': { rich_text: [{ text: { content: row.id.toString() } }] }
                };

                const titleVal = row[titleCol] || row.id;
                props['Title'] = { title: [{ text: { content: titleVal.toString() } }] };

                if (['cursos', 'embarcaciones', 'instructores', 'habilidades'].includes(sbTable)) {
                    props['Nombre'] = { title: [{ text: { content: titleVal.toString() } }] };
                }
                if (sbTable === 'sesiones') props['Edicion'] = { title: [{ text: { content: titleVal.toString() } }] };
                if (sbTable === 'mensajes_contacto') props['Asunto'] = { title: [{ text: { content: titleVal.toString() } }] };

                for (const colName of Object.keys(propDefinitions)) {
                    if (colName === 'id' || colName === titleCol) continue;
                    const val = row[colName];
                    if (val === null || val === undefined) continue;

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
                        props[colName] = { rich_text: [{ text: { content: val.toString().substring(0, 2000) } }] };
                    }
                }

                if (index[row.id]) {
                    await this.notion.pages.update({ page_id: index[row.id].id, properties: props });
                } else {
                    await this.notion.pages.create({ parent: { database_id: dbId }, properties: props });
                }
            }
        } else {
            for (const page of (notionPages as any[])) {
                const sbId = page.properties['Supabase_ID']?.rich_text?.[0]?.plain_text;
                if (!sbId) continue;

                const updateData: any = {};
                let hasChanges = false;

                for (const [propName, propValue] of Object.entries(page.properties) as [string, any][]) {
                    if (['Supabase_ID', 'Title', 'Nombre', 'Edicion', 'Asunto'].includes(propName)) continue;
                    if (!propDefinitions[propName]) continue;

                    let val: any;
                    if (propValue.type === 'rich_text') val = propValue.rich_text?.[0]?.plain_text;
                    else if (propValue.type === 'title') val = propValue.title?.[0]?.plain_text;
                    else if (propValue.type === 'number') val = propValue.number;
                    else if (propValue.type === 'checkbox') val = propValue.checkbox;
                    else if (propValue.type === 'select') val = propValue.select?.name;
                    else if (propValue.type === 'multi_select') val = propValue.multi_select?.map((x: any) => x.name);
                    else if (propValue.type === 'date') val = propValue.date?.start;
                    else if (propValue.type === 'email') val = propValue.email;

                    if (val !== undefined) {
                        updateData[propName] = val;
                        hasChanges = true;
                    }
                }

                if (hasChanges) {
                    const { error } = await (this.supabase.from(sbTable) as any).update(updateData).eq('id', sbId);
                    if (error) console.error(`Failed to update Supabase row ${sbId}:`, error.message);
                }
            }
        }

        return { success: true };
    }

    async updateDashboard() {
        console.log('🚀 Starting Dashboard Update...');
        const stats = await this.fetchDashboardStats();
        await this.clearPageChildren(this.DASHBOARD_PAGE_ID);
        await this.buildDashboardBlocks(this.DASHBOARD_PAGE_ID, stats);
        return { success: true };
    }

    async getGlobalMetrics() {
        const data = await this.notion.databases.query({ database_id: this.FLEET_DB_ID });
        const results = data.results || [];

        let totalROI = 0;
        let totalRevenue = 0;
        let totalExpenses = 0;
        let activeAlerts = 0;

        results.forEach((page: any) => {
            const props = page.properties;
            totalROI += props.ROI_Porcentaje_Auto?.formula?.number || 0;
            totalRevenue += props.Ingresos_por_Reservas?.rollup?.number || 0;
            totalRevenue += props.Ingresos_Extra_Manual?.number || 0;
            totalExpenses += props.Gastos_Mantenimiento?.number || 0;
            if (props.Alerta_Rentabilidad?.formula?.string?.includes('🚨')) {
                activeAlerts++;
            }
        });

        const avgROI = results.length > 0 ? (totalROI / results.length).toFixed(1) : 0;

        return {
            avgROI,
            totalRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses,
            activeAlerts,
            fleetSize: results.length
        };
    }

    async getFleetMetrics() {
        const data = await this.notion.databases.query({
            database_id: this.FLEET_DB_ID,
            filter: {
                property: 'Nombre',
                title: { is_not_empty: true }
            }
        });

        return data.results.map((page: any) => ({
            id: page.id,
            supabase_id: page.properties.Supabase_ID?.rich_text[0]?.plain_text || null,
            nombre: page.properties.Nombre?.title[0]?.plain_text || 'Sin nombre',
            roi: page.properties.ROI_Porcentaje_Auto?.formula?.number || 0,
            beneficio: page.properties.Beneficio_Neto_Auto?.formula?.number || 0,
            alerta: page.properties.Alerta_Rentabilidad?.formula?.string || '✅ Saludable',
            ingresos_reservas: page.properties.Ingresos_por_Reservas?.rollup?.number || 0,
            gastos: page.properties.Gastos_Mantenimiento?.number || 0,
            notion_url: page.url
        }));
    }

    private async fetchDashboardStats() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const firstOfMonth = today.slice(0, 7) + '-01';
        const firstOfYear = today.slice(0, 4) + '-01-01';

        const [
            { data: revToday },
            { data: revMonth },
            { data: revYear },
            { data: students },
            { data: socios },
            { data: staff },
            { data: boats },
            { data: subscribers }
        ] = await Promise.all([
            this.supabase.from('reservas_alquiler').select('monto_total').gte('fecha_pago', today),
            this.supabase.from('reservas_alquiler').select('monto_total').gte('fecha_pago', firstOfMonth),
            this.supabase.from('reservas_alquiler').select('monto_total').gte('fecha_pago', firstOfYear),
            this.supabase.from('profiles').select('id').eq('rol', 'alumno'),
            this.supabase.from('profiles').select('id').eq('rol', 'socio'),
            this.supabase.from('profiles').select('id').in('rol', ['admin', 'instructor']),
            this.supabase.from('embarcaciones').select('nombre,estado'),
            this.supabase.from('newsletter_subscriptions').select('id')
        ]);

        const sumMonto = (arr: any[] | null) => (arr || []).reduce((acc, curr) => acc + (Number(curr.monto_total) || 0), 0);

        const { data: rawAuditLogs } = await this.supabase
            .from('audit_logs')
            .select('action_type,description,created_at,staff_id')
            .order('created_at', { ascending: false })
            .limit(8);

        const auditLogs = await Promise.all((rawAuditLogs as any[] || []).map(async log => {
            const { data: operator } = await this.supabase
                .from('profiles')
                .select('nombre')
                .eq('id', log.staff_id)
                .single() as any;

            return {
                action: log.action_type,
                desc: log.description,
                time: new Date(log.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                operator: operator?.nombre || 'Sistemas'
            };
        }));

        const { data: rawRentals } = await this.supabase
            .from('reservas_alquiler')
            .select('id,monto_total,perfil_id,servicio_id,estado_entrega,fecha_reserva,hora_inicio')
            .order('created_at', { ascending: false })
            .limit(10);

        const recentRentals = await Promise.all((rawRentals as any[] || []).map(async r => {
            const [{ data: p }, { data: s }] = await Promise.all([
                this.supabase.from('profiles').select('nombre,apellidos').eq('id', r.perfil_id).single() as any,
                this.supabase.from('servicios_alquiler').select('nombre_es').eq('id', r.servicio_id).single() as any
            ]);

            return {
                customer: `${p?.nombre || ''} ${p?.apellidos || ''}`.trim(),
                amount: r.monto_total,
                service: s?.nombre_es,
                status: r.estado_entrega,
                time: r.hora_inicio || '00:00'
            };
        }));

        return {
            revenue: { today: sumMonto(revToday), month: sumMonto(revMonth), year: sumMonto(revYear) },
            counts: {
                students: students?.length || 0,
                socios: socios?.length || 0,
                staff: staff?.length || 0,
                boats: boats?.length || 0,
                subs: subscribers?.length || 0,
                rentals_pending: (rawRentals as any[] || []).filter(r => r.estado_entrega === 'pendiente').length
            },
            auditLogs,
            recentRentals,
            boats: boats || []
        };
    }

    private async clearPageChildren(pageId: string) {
        const { results } = await this.notion.blocks.children.list({ block_id: pageId });
        for (const block of results) {
            await this.notion.blocks.delete({ block_id: block.id });
            await new Promise(r => setTimeout(r, 100));
        }
    }

    private async buildDashboardBlocks(pageId: string, stats: any) {
        const rt = (content: string, bold = false, color: any = 'default', link: string | null = null): any => ({
            type: 'text', text: { content: String(content || '') }, link: link ? { url: link } : null,
            annotations: { bold, color }
        });

        const shortcuts = (label: string, dbId: string | undefined): any => {
            const url = dbId ? `https://www.notion.so/${dbId.replace(/-/g, '')}` : null;
            return rt(`${label} ➔\n`, true, 'blue', url);
        };

        const getStatusInfo = (status: string) => {
            switch (status) {
                case 'entregado': return { emoji: '🌊', text: 'EN AGUA', color: 'blue' };
                case 'devuelto': return { emoji: '✅', text: 'FINALIZADO', color: 'green' };
                default: return { emoji: '⏳', text: 'PENDIENTE', color: 'orange' };
            }
        };

        const blocks: any[] = [
            { type: 'heading_1', heading_1: { rich_text: [rt('⚓ GESTIÓN INTEGRAL: GETXO BELA ESKOLA')] } },
            {
                type: 'paragraph', paragraph: {
                    rich_text: [
                        rt('Espejo en tiempo real del Panel Administrativo Web. '),
                        rt('Supabase Analytics Engine Active.', true, 'green'),
                        rt(`\nÚltima sincronización: ${new Date().toLocaleString('es-ES')}`, false, 'gray')
                    ]
                }
            },
            { type: 'divider', divider: {} },

            { type: 'heading_2', heading_2: { rich_text: [rt('💰 INTELIGENCIA FINANCIERA')] } },
            {
                type: 'column_list', column_list: {
                    children: [
                        { type: 'column', column: { children: [{ type: 'callout', callout: { rich_text: [rt('HOY\n', true), rt(`${stats.revenue.today} €`)], icon: { type: 'emoji', emoji: '💸' }, color: 'blue_background' } }] } },
                        { type: 'column', column: { children: [{ type: 'callout', callout: { rich_text: [rt('ESTE MES\n', true), rt(`${stats.revenue.month} €`)], icon: { type: 'emoji', emoji: '📊' }, color: 'green_background' } }] } },
                        { type: 'column', column: { children: [{ type: 'callout', callout: { rich_text: [rt('ESTE AÑO\n', true), rt(`${stats.revenue.year} €`)], icon: { type: 'emoji', emoji: '🏦' }, color: 'purple_background' } }] } }
                    ]
                }
            },

            { type: 'heading_2', heading_2: { rich_text: [rt('🚤 CONTROL DE ALQUILERES (Salidas)')] } },
            {
                type: 'column_list', column_list: {
                    children: [
                        {
                            type: 'column', column: {
                                children: [
                                    { type: 'paragraph', paragraph: { rich_text: [rt('Últimas 10 operaciones de flota:', true)] } },
                                    ...stats.recentRentals.map((r: any) => {
                                        const st = getStatusInfo(r.status);
                                        return {
                                            type: 'bulleted_list_item', bulleted_list_item: {
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
                            type: 'column', column: {
                                children: [
                                    { type: 'callout', callout: { rich_text: [rt('Alertas de Salida:\n', true), rt(`${stats.counts.rentals_pending} pendientes de entrega.`, false, stats.counts.rentals_pending > 0 ? 'orange' : 'default')], icon: { type: 'emoji', emoji: '🚨' } } },
                                    { type: 'callout', callout: { rich_text: [rt('Estado de Suscriptores: ', true), rt(`${stats.counts.subs} 📬`)], icon: { type: 'emoji', emoji: '📧' } } }
                                ]
                            }
                        }
                    ]
                }
            },

            { type: 'heading_2', heading_2: { rich_text: [rt('📡 RADAR DE OPERACIONES (Audit Log)')] } },
            {
                type: 'column_list', column_list: {
                    children: [
                        {
                            type: 'column', column: {
                                children: [
                                    ...stats.auditLogs.map((log: any) => ({
                                        type: 'bulleted_list_item', bulleted_list_item: {
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
                            type: 'column', column: {
                                children: [
                                    { type: 'callout', callout: { rich_text: [rt('Academia Activa: ', true), rt(`${stats.counts.students} alumn.`)], icon: { type: 'emoji', emoji: '📜' }, color: 'gray_background' } },
                                    { type: 'callout', callout: { rich_text: [rt('Flota Lista: ', true), rt(`${stats.boats.filter((b: any) => b.estado === 'listo').length}`)], icon: { type: 'emoji', emoji: '⛵' }, color: 'blue_background' } }
                                ]
                            }
                        }
                    ]
                }
            },

            { type: 'divider', divider: {} },
            { type: 'heading_2', heading_2: { rich_text: [rt('🌍 ECOSISTEMA DE DATOS (Master Access)')] } },
            {
                type: 'column_list', column_list: {
                    children: [
                        { type: 'column', column: { children: [{ type: 'callout', callout: { rich_text: [rt('🏢 CRM & VENTAS\n', true), shortcuts('Inscripciones', this.tableMap.inscripciones), shortcuts('Reservas Alquiler', this.tableMap.reservas_alquiler), shortcuts('Newsletter', this.tableMap.newsletter_subscriptions)], icon: { type: 'emoji', emoji: '🏬' }, color: 'orange_background' } }] } },
                        { type: 'column', column: { children: [{ type: 'callout', callout: { rich_text: [rt('⚓ OPERACIONES\n', true), shortcuts('Flota', this.tableMap.embarcaciones), shortcuts('Escuela Sesiones', this.tableMap.sesiones), shortcuts('Logs Auditoría', this.tableMap.audit_logs)], icon: { type: 'emoji', emoji: '⚙️' }, color: 'blue_background' } }] } },
                        { type: 'column', column: { children: [{ type: 'callout', callout: { rich_text: [rt('🎓 ACADEMIA\n', true), shortcuts('Cursos', this.tableMap.cursos), shortcuts('Ediciones', this.tableMap.ediciones_curso), shortcuts('Perfiles Master', this.tableMap.profiles)], icon: { type: 'emoji', emoji: '📚' }, color: 'green_background' } }] } }
                    ]
                }
            }
        ];

        const chunkSize = 25;
        for (let i = 0; i < blocks.length; i += chunkSize) {
            await this.notion.blocks.children.append({
                block_id: pageId,
                children: blocks.slice(i, i + chunkSize)
            });
        }
    }
}
