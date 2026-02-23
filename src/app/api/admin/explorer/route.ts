import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Simple map of important relations to check
const RELATIONS: Record<string, { table: string, fk: string, label: string }[]> = {
    profiles: [
        { table: 'reservas_alquiler', fk: 'perfil_id', label: 'Alquileres' },
        { table: 'inscripciones', fk: 'perfil_id', label: 'Cursos Inscritos' },
        { table: 'mensajes_contacto', fk: 'email', label: 'Mensajes (por Email)' }, // Special email linkage
        { table: 'newsletter_subscriptions', fk: 'email', label: 'Susufrpcioines (por Email)' }
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

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const table = searchParams.get('table') || 'all';

    if (!query) return NextResponse.json({ results: [] });

    const supabase = createClient();
    let results: any[] = [];

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

        // Enrich with relations count
        const rels = RELATIONS[tableName] || [];
        const relationCounts: Record<string, Record<string, number>> = {}; // label -> { fkValue -> count }

        // Batch fetch counts for each relation type
        for (const rel of rels) {
            const isEmail = rel.fk === 'email';
            // Collect all FK values from the current page of results
            const fkValues = (data || [])
                .map((item: any) => isEmail ? item.email : item.id)
                .filter(Boolean); // Filter out null/undefined/empty

            // Deduplicate FKs
            const uniqueFkValues = Array.from(new Set(fkValues));

            if (uniqueFkValues.length === 0) continue;

            // Fetch all related items that match any of the FKs
            // We only need the FK column to count groupings in memory
            const { data: relatedData, error: relatedError } = await supabase
                .from(rel.table)
                .select(rel.fk)
                .in(rel.fk, uniqueFkValues);

            if (relatedError || !relatedData) {
                console.error(`Error fetching relation ${rel.label}:`, relatedError);
                continue;
            }

            // Count occurrences in memory
            const counts = relatedData.reduce((acc: any, curr: any) => {
                const key = curr[rel.fk];
                if (key) {
                    acc[key] = (acc[key] || 0) + 1;
                }
                return acc;
            }, {});

            relationCounts[rel.label] = counts;
        }

        // Map counts back to items
        const enriched = (data || []).map((item: any) => {
            const relations: any[] = [];

            for (const rel of rels) {
                const isEmail = rel.fk === 'email';
                const fkValue = isEmail ? item.email : item.id;

                if (!fkValue) continue;

                // Lookup count
                const count = relationCounts[rel.label]?.[fkValue];

                if (count && count > 0) {
                    relations.push({ label: rel.label, count, table: rel.table });
                }
            }
            return {
                ...item,
                _table: tableName,
                _title: item.nombre || item.title || item.name || item.asunto || item.id, // Best effort title
                _relations: relations
            };
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
