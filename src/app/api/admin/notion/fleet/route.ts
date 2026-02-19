
import { NextResponse } from 'next/server';

const NOTION_TOKEN = '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';
const FLEET_DB_ID = '30c31210-b1a1-813b-a949-d7ddf66d84c9';

export async function GET() {
    try {
        const res = await fetch(`https://api.notion.com/v1/databases/${FLEET_DB_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_TOKEN}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filter: {
                    property: 'Nombre',
                    title: { is_not_empty: true }
                }
            })
        });

        const data = await res.json();

        if (data.object === 'error') {
            return NextResponse.json({ error: data.message }, { status: 400 });
        }

        const fleetMetrics = data.results.map((page: any) => ({
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

        return NextResponse.json({ fleet: fleetMetrics });
    } catch (error) {
        console.error('Notion API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
