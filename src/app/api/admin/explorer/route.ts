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
        const start = performance.now();
        const cols = SEARCHABLE_COLS[tableName] || ['id'];
        const orFilter = cols.map(c => `${c}.ilike.%${query}%`).join(',');

        // 1. Base Query
        const { data: baseData, error } = await supabase
            .from(tableName)
            .select('*')
            .or(orFilter)
            .limit(5);

        if (error) {
            console.error(`Search error in ${tableName}:`, error);
            return [];
        }

        const items = baseData as SearchResult[];
        if (items.length === 0) return [];

        // 2. Collect Keys
        const ids = items.map(i => i.id);
        const emails = items.map(i => i.email).filter(Boolean) as string[];

        const rels = RELATIONS[tableName] || [];

        // 3. Batch Query per Relation
        // We will store counts in a map: Map<relationIndex, Map<keyValue, count>>
        const relationCounts = new Map<number, Map<string, number>>();

        for (let i = 0; i < rels.length; i++) {
            const rel = rels[i];
            const isEmail = rel.fk === 'email';
            const keysToCheck = isEmail ? emails : ids;

            if (keysToCheck.length === 0) continue;

            try {
                // Execute ONE query per relation for all items
                // Using select(fk) allows us to fetch all matching rows and group in memory
                const { data: relData, error: relError } = await supabase
                    .from(rel.table)
                    .select(rel.fk, { count: 'exact', head: false })
                    .in(rel.fk, keysToCheck);

                if (relError) {
                    console.error(`Relation batch error ${rel.table}:`, relError);
                    continue;
                }

                // Aggregate in memory
                const counts = new Map<string, number>();
                (relData || []).forEach((row: any) => {
                    const key = row[rel.fk];
                    if (key) {
                        counts.set(key, (counts.get(key) || 0) + 1);
                    }
                });
                relationCounts.set(i, counts);

            } catch (err) {
                console.error(`Batch process error ${rel.table}`, err);
            }
        }

        // 4. Enrich Items
        const enriched = items.map(item => {
            const relations: { label: string; count: number; table: string }[] = [];

            rels.forEach((rel, idx) => {
                const countMap = relationCounts.get(idx);
                if (countMap) {
                    const key = (rel.fk === 'email' ? item.email : item.id) as string;
                    const count = countMap.get(key) || 0;
                    if (count > 0) {
                        relations.push({ label: rel.label, count, table: rel.table });
                    }
                }
            });

            return {
                ...item,
                _table: tableName,
                _title: item.nombre || item.title || item.name || item.asunto || item.id, // Best effort title
                _relations: relations
            };
        });

        const end = performance.now();
        // Log performance metrics
        console.log(`[Explorer] ${tableName} search: ${(end - start).toFixed(2)}ms | Queries: 1 + ${rels.length} relations`);

        return enriched;
    };

    if (table === 'all') {
        // Search key tables
        const tablesToSearch = ['profiles', 'cursos', 'embarcaciones', 'reservas_alquiler'];
        for (const t of tablesToSearch) {
            const res = await searchTable(t) as SearchResult[];
            results = [...results, ...res];
        }
    } else {
        results = await searchTable(table) as SearchResult[];
    }

    return NextResponse.json({ results });
}
