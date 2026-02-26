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

    // Ensure we await the client creation as per project convention
    const supabase = await createClient();
    let results: SearchResult[] = [];

    const searchTable = async (tableName: string) => {
        const cols = SEARCHABLE_COLS[tableName] || ['id'];
        // Construct OR filter: col1.ilike.%q%,col2.ilike.%q%
        const orFilter = cols.map(c => `${c}.ilike.%${query}%`).join(',');

        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .or(orFilter)
            .limit(5);

        if (error) {
            console.error(`Search error in ${tableName}:`, error);
            return [];
        }

        if (!data || data.length === 0) return [];

        const rows = data as SearchResult[];
        const rels = RELATIONS[tableName] || [];
        const relationCountsByRow = new Map<string, { label: string; count: number; table: string }[]>();

        // Initialize empty relations for all rows
        rows.forEach(row => relationCountsByRow.set(row.id, []));

        // Start performance timer
        const start = performance.now();

        // 2. Process each relation independently (Batching Option B)
        for (const rel of rels) {
            try {
                // Determine the key on the main row based on convention
                // If fk is 'email', we join on email. Otherwise we join on id.
                const mainKey = rel.fk === 'email' ? 'email' : 'id';

                // Collect values from valid rows
                const values = rows
                    .map(r => r[mainKey])
                    .filter(v => v !== null && v !== undefined && v !== '');

                if (values.length === 0) continue;

                // Execute single query for this relation using IN (...)
                // We select only the FK column to count in memory
                const { data: relatedData, error: relError } = await supabase
                    .from(rel.table)
                    .select(rel.fk)
                    .in(rel.fk, values);

                if (relError) {
                    console.error(`Error fetching relation ${rel.table} for ${tableName}:`, relError);
                    continue; // Skip this relation on error
                }

                // Aggregate counts in memory
                const counts = new Map<string, number>();
                (relatedData || []).forEach((item: any) => {
                    const key = item[rel.fk];
                    if (key) {
                        const keyStr = String(key);
                        counts.set(keyStr, (counts.get(keyStr) || 0) + 1);
                    }
                });

                // Attach counts to rows
                rows.forEach(row => {
                    const rowVal = row[mainKey];
                    if (rowVal) {
                        const count = counts.get(String(rowVal)) || 0;
                        if (count > 0) {
                            const current = relationCountsByRow.get(row.id) || [];
                            current.push({ label: rel.label, count, table: rel.table });
                            relationCountsByRow.set(row.id, current);
                        }
                    }
                });

            } catch (err) {
                console.error(`Exception processing relation ${rel.table}:`, err);
                // Maintain behavior: skip if relation fails
            }
        }

        const end = performance.now();
        // Log performance metric
        console.log(`[Explorer] Relation batching for ${tableName} (${rows.length} rows) took ${(end - start).toFixed(2)}ms`);

        // 3. Construct enriched result preserving original shape
        return rows.map(item => ({
            ...item,
            _table: tableName,
            _title: item.nombre || item.title || item.name || item.asunto || item.id, // Best effort title
            _relations: relationCountsByRow.get(item.id) || []
        }));
    };

    if (table === 'all') {
        // Search key tables
        const tablesToSearch = Object.keys(SEARCHABLE_COLS);
        const searchPromises = tablesToSearch.map(t => searchTable(t));
        const searchResults = await Promise.all(searchPromises);
        results = searchResults.flat() as SearchResult[];
    } else {
        results = await searchTable(table) as SearchResult[];
    }

    return NextResponse.json({ results });
}
