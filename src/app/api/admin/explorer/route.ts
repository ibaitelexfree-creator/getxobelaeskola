
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Simple map of important relations to check
const RELATIONS: Record<string, { table: string, fk: string, label: string }[]> = {
    profiles: [
        { table: 'reservas_alquiler', fk: 'perfil_id', label: 'Alquileres' },
        { table: 'inscripciones', fk: 'perfil_id', label: 'Cursos Inscritos' },
        { table: 'mensajes_contacto', fk: 'email', label: 'Mensajes (por Email)' }, // Special email linkage
        { table: 'newsletter_subscriptions', fk: 'email', label: 'Suscripciones (por Email)' }
    ],
    cursos: [
        { table: 'ediciones_curso', fk: 'curso_id', label: 'Ediciones Programadas' },
        { table: 'inscripciones', fk: 'curso_id', label: 'Alumnos Totales' }
    ],
    embarcaciones: [
        { table: 'mantenimiento_logs', fk: 'embarcacion_id', label: 'Historial Mantenimiento' }
    ]
};

const SEARCHABLE_COLS: Record<string, string[]> = {
    profiles: ['nombre', 'apellidos', 'email', 'telefono'],
    reservas_alquiler: ['id', 'estado_entrega'], // Maybe search by ID
    cursos: ['nombre', 'descripcion_es'],
    embarcaciones: ['nombre', 'matricula'],
    mensajes_contacto: ['nombre', 'email', 'asunto', 'mensaje'],
    newsletter_subscriptions: ['email']
};

interface SearchResult {
    id: string;
    nombre?: string;
    name?: string;
    title?: string;
    asunto?: string;
    email?: string;
    [key: string]: unknown;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const table = searchParams.get('table') || 'all';

    if (!query) return NextResponse.json({ results: [] });

    const supabase = createClient();
    let results: SearchResult[] = [];

    const searchTable = async (tableName: string) => {
        const cols = SEARCHABLE_COLS[tableName] || ['id'];
        // Construct OR filter: col1.ilike.%q%,col2.ilike.%q%
        const orFilter = cols.map(c => `${c}.ilike.%${query}%`).join(',');

        const rels = RELATIONS[tableName] || [];
        // Construct select with resource embedding for counts to avoid N+1 queries
        // Format: *, related_table!fk_col(count)
        const selectCols = [
            '*',
            ...rels.map(rel => `${rel.table}!${rel.fk}(count)`)
        ].join(',');

        const { data, error } = await supabase
            .from(tableName)
            .select(selectCols)
            .or(orFilter)
            .limit(5);

        if (error) {
            console.error(`Search error in ${tableName}:`, error);
            return [];
        }

        // Enrich with relations count from embedded data
        const enriched = (data || []).map((item: any) => {
            const relations: { label: string; count: number; table: string }[] = [];

            for (const rel of rels) {
                // Embedded counts return as an array with a single object: [{ count: N }]
                // This is much more efficient than performing a separate query for each item
                const embedded = item[rel.table] as { count: number }[] | undefined;
                const count = (embedded && Array.isArray(embedded)) ? (embedded[0]?.count || 0) : 0;

                if (count > 0) {
                    relations.push({ label: rel.label, count, table: rel.table });
                }
            }

            return {
                ...item,
                id: item.id || 'unknown', // Ensure ID is present
                _table: tableName,
                _title: item.nombre || item.title || item.name || item.asunto || item.id || 'Untitled', // Best effort title
                _relations: relations
            } as SearchResult;
        });

        return enriched;
    };

    if (table === 'all') {
        // Search key tables
        const tablesToSearch = ['profiles', 'cursos', 'embarcaciones', 'reservas_alquiler'];
        for (const t of tablesToSearch) {
            const res = await searchTable(t);
            results = [...results, ...res];
        }
    } else {
        results = await searchTable(table);
    }

    return NextResponse.json({ results });
}
