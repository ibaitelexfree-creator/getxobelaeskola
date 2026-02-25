const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load env (manual parsing for .env.local)
let SUPABASE_URL, SUPABASE_KEY;
try {
    const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
    envFile.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length < 2) return;
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();

        if (key === 'NEXT_PUBLIC_SUPABASE_URL') SUPABASE_URL = value;
        if (key === 'SUPABASE_SERVICE_ROLE_KEY') SUPABASE_KEY = value;
    });
} catch (e) {
    console.error('Could not read .env.local', e);
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
console.log('Using URL:', SUPABASE_URL);

const COURSE_SLUG = 'iniciacion-vela-ligera';

// Full Structure Data
const MODULES = [
    {
        slug: 'introduccion-seguridad',
        nombre_es: 'Introducción y Seguridad',
        orden: 1,
        units: [
            { slug: 'seguridad-en-el-mar', nombre_es: 'Seguridad en el Mar', orden: 1 },
            { slug: 'partes-del-barco', nombre_es: 'Partes del Barco', orden: 2 }
        ]
    },
    {
        slug: 'teoria-navegacion',
        nombre_es: 'Teoría de la Navegación',
        orden: 2,
        units: [
            { slug: 'como-funciona-la-vela', nombre_es: 'Cómo Funciona la Vela', orden: 1 },
            { slug: 'la-terminologia-nautica', nombre_es: 'La Terminología Náutica', orden: 2 },
            { slug: 'los-rumbos-respecto-al-viento', nombre_es: 'Los Rumbos Respecto al Viento', orden: 3 }
        ]
    },
    {
        slug: 'tecnica-navegacion',
        nombre_es: 'Técnica de Navegación',
        orden: 3,
        units: [
            { slug: 'preparacion-aparejado', nombre_es: 'Preparación y Aparejado del Barco', orden: 1 },
            { slug: 'la-virada-por-avante', nombre_es: 'La Virada por Avante', orden: 2 },
            { slug: 'la-trasluchada', nombre_es: 'La Trasluchada', orden: 3 },
            { slug: 'parar-arrancar-seguridad', nombre_es: 'Parar, Arrancar y Posición de Seguridad', orden: 4 }
        ]
    },
    {
        slug: 'reglamento-marineria',
        nombre_es: 'Reglamento y Marinería',
        orden: 4,
        units: [
            { slug: 'reglas-navegacion-basicas', nombre_es: 'Reglas de Navegación Básicas', orden: 1 },
            { slug: 'nudos-esenciales', nombre_es: 'Nudos Esenciales', orden: 2 },
            { slug: 'tu-primera-navegacion', nombre_es: 'Tu Primera Navegación Completa', orden: 3 }
        ]
    }
];

const QUESTION_FILES = [
    'contenido_academico/curso1_banco_preguntas_parte1.md',
    'contenido_academico/curso1_banco_preguntas_parte2.md',
    'contenido_academico/curso1_banco_preguntas_parte3.md',
    'contenido_academico/curso1_banco_preguntas_parte4.md'
];

const HEADER_UNIT_MAP = {
    1: 'seguridad-en-el-mar',
    2: 'partes-del-barco',
    3: 'como-funciona-la-vela',
    4: 'la-terminologia-nautica',
    5: 'los-rumbos-respecto-al-viento',
    6: 'preparacion-aparejado',
    7: 'la-virada-por-avante',
    8: 'la-trasluchada',
    9: 'parar-arrancar-seguridad',
    10: 'reglas-navegacion-basicas',
    11: 'nudos-esenciales',
    12: 'tu-primera-navegacion'
};

/* Helper Functions */
function parseQuestion(block) {
    let statement = '';
    let options = {};
    let correct = '';
    let explanation = '';
    let type = 'multiple_choice';

    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    const isStructured = lines.some(l => l.startsWith('Tipo:'));

    if (isStructured) {
        let currentField = null;
        lines.forEach(line => {
            if (line.startsWith('Tipo:')) {
                const t = line.split(':')[1].toLowerCase();
                if (t.includes('verdadero')) type = 'true_false';
            } else if (line.startsWith('Pregunta:')) {
                statement = line.replace('Pregunta:', '').trim();
            } else if (line.match(/^[A-D]\)/)) {
                const letter = line.charAt(0).toLowerCase();
                options[letter] = line.substring(2).trim();
            } else if (line.startsWith('Respuesta correcta:')) {
                let ans = line.split(':')[1].trim();
                if (ans === 'Verdadero') correct = 'a';
                else if (ans === 'Falso') correct = 'b';
                else correct = ans.toLowerCase();
            } else if (line.startsWith('Explicación:')) {
                explanation = line.replace('Explicación:', '').trim();
            } else if (!line.startsWith('**Pregunta') && !line.startsWith('Tipo:') && !Object.keys(options).length && !line.startsWith('Respuesta')) {
                if (statement && !line.match(/^[A-D]\)/)) statement += ' ' + line;
            }
        });
        if (type === 'true_false' && Object.keys(options).length === 0) {
            options = { a: 'Verdadero', b: 'Falso' };
        }
    } else {
        // Simple
        let optionStart = lines.findIndex(l => l.match(/^[A-D]\)/));
        if (optionStart === -1) return null;

        statement = lines.slice(1, optionStart).join(' ').trim();

        for (let i = optionStart; i < lines.length; i++) {
            const line = lines[i];
            if (line.match(/^[A-D]\)/)) {
                const letter = line.charAt(0).toLowerCase();
                options[letter] = line.substring(2).trim();
            } else if (line.startsWith('**Correcta:')) {
                correct = line.split(':')[1].trim().toLowerCase().replace(/\*/g, '');
            }
        }
    }

    if (!statement || !correct) return null;
    return { statement, options, correct, explanation, type };
}

async function main() {
    console.log('--- Phase 1 Seed: Course 1 ---');

    // 0. Ensure Level exists
    let { data: level } = await supabase.from('niveles_formacion').select('id').eq('slug', 'iniciacion').maybeSingle();
    let levelId = level?.id;

    if (!levelId) {
        console.log('Inserting Level "iniciacion"...');
        const { data, error } = await supabase.from('niveles_formacion').insert({
            slug: 'iniciacion',
            nombre_es: 'Iniciación a la Vela',
            nombre_eu: 'Belaren Hasiera',
            orden: 1,
            descripcion_es: 'Primer contacto.',
            objetivo_formativo_es: 'Aprender a navegar.',
            perfil_alumno_es: 'Principiante',
            duracion_teorica_h: 20,
            duracion_practica_h: 10,
            icono: '⚓'
        }).select().single();
        if (error) { console.error('Error creating level:', error); return; }
        levelId = data.id;
    }
    console.log(`Level ID: ${levelId}`);

    // 1. Ensure Course exists
    let { data: course } = await supabase.from('cursos').select('id').eq('slug', COURSE_SLUG).maybeSingle();
    let courseId = course?.id;

    if (!courseId) {
        console.log(`Inserting Course "${COURSE_SLUG}"...`);
        const { data, error } = await supabase.from('cursos').insert({
            slug: COURSE_SLUG,
            nombre_es: 'Iniciación a la Vela Ligera',
            nombre_eu: 'Bela Arinaren Hasiera',
            descripcion_es: 'Curso completo.',
            descripcion_eu: 'Hasiera ikastaroa.',
            duracion_h: 20,
            horas_teoricas: 6,
            horas_practicas: 14,
            nivel_formacion_id: levelId,
            orden_en_nivel: 1,
            activo: true,
            objetivos_json: ['Aprender a navegar', 'Seguridad en el mar'],
            competencias_json: ['Navegación básica', 'Terminología náutica']
        }).select().single();

        if (error) { console.error('Error creating course:', JSON.stringify(error, null, 2)); return; }
        courseId = data.id;
    }
    console.log(`Course ID: ${courseId}`);

    // 2. Ensure Modules & Units exist
    for (const modData of MODULES) {
        const { data: mod, error: modErr } = await supabase
            .from('modulos')
            .upsert({
                curso_id: courseId,
                slug: modData.slug,
                nombre_es: modData.nombre_es,
                nombre_eu: modData.nombre_es + ' (EU)',
                orden: modData.orden
            }, { onConflict: 'curso_id, slug' })
            .select()
            .single();

        if (modErr) {
            console.error(`Error upserting module ${modData.slug}:`, modErr);
            continue;
        }

        console.log(`  Module: ${mod.nombre_es}`);

        for (const unitData of modData.units) {
            const { error: unitErr } = await supabase
                .from('unidades_didacticas')
                .upsert({
                    modulo_id: mod.id,
                    slug: unitData.slug,
                    nombre_es: unitData.nombre_es,
                    nombre_eu: unitData.nombre_es + ' (EU)',
                    orden: unitData.orden,
                    duracion_estimada_min: 45
                }, { onConflict: 'modulo_id, slug' });

            if (unitErr) console.error(`    Error upserting unit ${unitData.slug}:`, unitErr);
        }
    }
    console.log('Structure verified.');

    // 3. Parse and Seed Questions
    const { data: allUnits } = await supabase.from('unidades_didacticas').select('id, slug');
    if (!allUnits) return;
    const slugToId = {};
    allUnits.forEach(u => slugToId[u.slug] = u.id);

    let questionsToInsert = [];
    QUESTION_FILES.forEach(file => {
        const fullPath = path.join(__dirname, '../', file);
        if (!fs.existsSync(fullPath)) return;
        const content = fs.readFileSync(fullPath, 'utf-8');
        const parts = content.split(/(?=## UNIDAD \d+)/);

        parts.forEach(part => {
            const titleMatch = part.match(/## UNIDAD (\d+)/);
            if (!titleMatch) return;
            const unitNum = parseInt(titleMatch[1]);
            const unitSlug = HEADER_UNIT_MAP[unitNum];
            const unitId = slugToId[unitSlug];

            if (!unitId) {
                console.warn(`Unit ID not found for slug ${unitSlug}`);
                return;
            }

            const blocks = part.split(/\*\*Pregunta/).slice(1);
            blocks.forEach(block => {
                const q = parseQuestion('**Pregunta' + block);
                if (q) {
                    questionsToInsert.push({
                        entidad_tipo: 'unidad',
                        entidad_id: unitId,
                        pregunta_es: q.statement,
                        opciones_json: q.options,
                        respuesta_correcta: q.correct,
                        explicacion_es: q.explanation,
                        tipo: q.type,
                        dificultad: 'basico',
                        puntos: 10
                    });
                }
            });
        });
    });

    console.log(`Parsed ${questionsToInsert.length} questions.`);

    // 4. Batch Insert
    const BATCH_SIZE = 50;
    for (let i = 0; i < questionsToInsert.length; i += BATCH_SIZE) {
        const batch = questionsToInsert.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('preguntas').insert(batch);
        if (error) console.error('Error inserting batch:', error);
        else console.log(`Inserted ${i + batch.length}/${questionsToInsert.length}`);
    }

    console.log('Done.');
}

main();
