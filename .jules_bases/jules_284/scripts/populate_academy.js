
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const part = line.split('=');
        if (part.length >= 2) env[part[0].trim()] = part.slice(1).join('=').trim();
    });
    return env;
}

const env = getEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    console.log('🏗️  Iniciando reconstrucción de la Academia...');

    // 1. NIVEL
    console.log('Step 1: Nivel...');
    const { data: nivel } = await supabase.from('niveles_formacion').select('id').eq('slug', 'iniciacion').single();
    let nivelId = nivel?.id;
    if (!nivelId) {
        const { data: newNivel, error: e1 } = await supabase.from('niveles_formacion').insert({
            slug: 'iniciacion',
            nombre_es: 'Iniciación',
            nombre_eu: 'Hasiera',
            orden: 1
        }).select().single();
        if (e1) throw e1;
        nivelId = newNivel.id;
    }

    // 2. CURSO
    console.log('Step 2: Curso...');
    const { data: curso } = await supabase.from('cursos').select('id').eq('slug', 'iniciacion-vela-ligera').single();
    let cursoId = curso?.id;
    if (!cursoId) {
        const { data: newCurso, error: e2 } = await supabase.from('cursos').insert({
            nivel_formacion_id: nivelId,
            slug: 'iniciacion-vela-ligera',
            nombre_es: 'Iniciación a la Vela Ligera',
            nombre_eu: 'Bela Arinaren Hasiera',
            descripcion_es: 'Primer contacto con la navegación a vela.',
            descripcion_eu: 'Belarekin nabigatzeko lehen kontaktua.',
            duracion_h: 20,
            horas_teoricas: 6,
            horas_practicas: 14,
            orden_en_nivel: 1,
            activo: true,
            precio: 0
        }).select().single();
        if (e2) throw e2;
        cursoId = newCurso.id;
    }

    // 3. MÓDULOS
    console.log('Step 3: Módulos...');
    const modulosData = [
        { slug: 'introduccion-seguridad', nombre_es: 'Introducción y Seguridad', nombre_eu: 'Sarrera eta Segurtasuna', orden: 1 },
        { slug: 'teoria-navegacion', nombre_es: 'Teoría de la Navegación', nombre_eu: 'Nabigazio Teoria', orden: 2 },
        { slug: 'tecnica-maniobras', nombre_es: 'Técnica y Maniobras Básicas', nombre_eu: 'Teknika eta Oinarrizko Maniobrak', orden: 3 },
        { slug: 'seguridad-avanzada', nombre_es: 'Seguridad Avanzada y Reglamento', nombre_eu: 'Segurtasun Aurreratua eta Araudia', orden: 4 }
    ];

    const moduloIds = {};
    for (const m of modulosData) {
        const { data: mod } = await supabase.from('modulos').select('id').eq('slug', m.slug).eq('curso_id', cursoId).single();
        if (mod) {
            moduloIds[m.orden] = mod.id;
        } else {
            const { data: newMod, error: e3 } = await supabase.from('modulos').insert({
                curso_id: cursoId,
                ...m
            }).select().single();
            if (e3) throw e3;
            moduloIds[m.orden] = newMod.id;
        }
    }

    // 4. UNIDADES
    console.log('Step 4: Unidades...');
    const unidadesData = [
        { modulo: 1, slug: 'seguridad-en-el-mar', nombre_es: 'Seguridad en el Mar', nombre_eu: 'Itsasoko Segurtasuna', orden: 1 },
        { modulo: 1, slug: 'partes-del-barco', nombre_es: 'Partes del Barco', nombre_eu: 'Ontziaren Atalak', orden: 2 },
        { modulo: 1, slug: 'como-funciona-la-vela', nombre_es: 'Cómo Funciona la Vela', nombre_eu: 'Nola Erabiltzen den Bela', orden: 3 },
        { modulo: 1, slug: 'terminologia-nautica', nombre_es: 'La Terminología Náutica', nombre_eu: 'Terminologia Nautikoa', orden: 4 },
        { modulo: 2, slug: 'rumbos-de-navegacion', nombre_es: 'Los Rumbos Respecto al Viento', nombre_eu: 'Haizearekiko Norabideak', orden: 1 },
        { modulo: 2, slug: 'aparejar-y-desaparejar', nombre_es: 'Preparación y Aparejado del Barco', nombre_eu: 'Ontzia Prestatu eta Desmuntatu', orden: 2 },
        { modulo: 2, slug: 'la-virada-por-avante', nombre_es: 'La Virada por Avante', nombre_eu: 'Aurretik Biratzea', orden: 3 },
        { modulo: 2, slug: 'la-trasluchada', nombre_es: 'La Trasluchada', nombre_eu: 'Trasluchada', orden: 4 },
        { modulo: 3, slug: 'parar-arrancar-posicion-seguridad', nombre_es: 'Parar, Arrancar y Posición de Seguridad', nombre_eu: 'Gelditu, Abiatu eta Segurtasun Posizioa', orden: 1 },
        { modulo: 3, slug: 'reglas-de-navegacion', nombre_es: 'Reglas de Navegación Básicas', nombre_eu: 'Oinarrizko Nabigazio Arauak', orden: 2 },
        { modulo: 3, slug: 'nudos-basicos', nombre_es: 'Nudos Esenciales', nombre_eu: 'Oinarrizko Korapiloak', orden: 3 },
        { modulo: 3, slug: 'tu-primera-navegacion', nombre_es: 'Tu Primera Navegación Completa', nombre_eu: 'Zure Lehen Nabigazio Osoa', orden: 4 }
    ];

    const unitIdsBySlug = {};
    for (const u of unidadesData) {
        const { data: unit } = await supabase.from('unidades_didacticas').select('id').eq('slug', u.slug).single();
        if (unit) {
            unitIdsBySlug[u.slug] = unit.id;
        } else {
            const { data: newUnit, error: e4 } = await supabase.from('unidades_didacticas').insert({
                modulo_id: moduloIds[u.modulo],
                slug: u.slug,
                nombre_es: u.nombre_es,
                nombre_eu: u.nombre_eu,
                orden: u.orden,
                duracion_estimada_min: 30
            }).select().single();
            if (e4) throw e4;
            unitIdsBySlug[u.slug] = newUnit.id;
        }
    }

    // 5. EVALUACIONES (Containers)
    console.log('Step 5: Evaluaciones...');
    // Quizzes de unidad
    for (const u of unidadesData) {
        const { data: evalExist } = await supabase.from('evaluaciones')
            .select('id')
            .eq('entidad_id', unitIdsBySlug[u.slug])
            .eq('tipo', 'quiz_unidad')
            .maybeSingle();

        if (!evalExist) {
            const { error: insErr } = await supabase.from('evaluaciones').insert({
                tipo: 'quiz_unidad',
                entidad_tipo: 'unidad',
                entidad_id: unitIdsBySlug[u.slug],
                titulo_es: `Quiz: ${u.nombre_es}`,
                titulo_eu: `Quiz: ${u.nombre_eu}`,
                num_preguntas: 5,
                nota_aprobado: 60.00,
                cooldown_minutos: 2
            });
            if (insErr) console.error(`❌ Error insertando evaluación para unidad ${u.slug}:`, insErr.message);
            else console.log(`✅ Evaluación creada para unidad ${u.slug}`);
        }
    }

    // Exámenes de módulo
    for (const m of modulosData) {
        const { data: evalExist } = await supabase.from('evaluaciones')
            .select('id')
            .eq('entidad_id', moduloIds[m.orden])
            .eq('tipo', 'examen_modulo')
            .maybeSingle();

        if (!evalExist) {
            await supabase.from('evaluaciones').insert({
                tipo: 'examen_modulo',
                entidad_tipo: 'modulo',
                entidad_id: moduloIds[m.orden],
                titulo_es: `Examen Módulo: ${m.nombre_es}`,
                titulo_eu: `Examen Módulo: ${m.nombre_eu}`,
                num_preguntas: 15,
                tiempo_limite_min: 20,
                nota_aprobado: 70.00,
                intentos_ventana_limite: 3,
                intentos_ventana_horas: 24
            });
        }
    }

    console.log('✅ Estructura académica lista. Ahora parseando y cargando preguntas...');

    // 6. PARSEAR PREGUNTAS DE MD
    const mdFiles = [
        'curso1_banco_preguntas_parte1.md',
        'curso1_banco_preguntas_parte2.md',
        'curso1_banco_preguntas_parte3.md',
        'curso1_banco_preguntas_parte4.md'
    ];

    const slugMapping = {
        'Seguridad en el Mar': 'seguridad-en-el-mar',
        'Partes del Barco': 'partes-del-barco',
        'Cómo Funciona la Vela': 'como-funciona-la-vela',
        'La Terminología Náutica': 'terminologia-nautica',
        'Los Rumbos Respecto al Viento': 'rumbos-de-navegacion',
        'Preparación y Aparejado del Barco': 'aparejar-y-desaparejar',
        'La Virada por Avante': 'la-virada-por-avante',
        'La Trasluchada': 'la-trasluchada',
        'Parar, Arrancar y Posición de Seguridad': 'parar-arrancar-posicion-seguridad',
        'Reglas de Navegación Básicas': 'reglas-de-navegacion',
        'Nudos Esenciales': 'nudos-basicos',
        'Tu Primera Navegación Completa': 'tu-primera-navegacion'
    };

    let totalPreguntas = 0;

    for (const file of mdFiles) {
        const content = fs.readFileSync(path.join(process.cwd(), 'contenido_academico', file), 'utf8');
        const lines = content.split('\n');
        let currentUnitSlug = null;
        let currentQuestion = null;

        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('## UNIDAD')) {
                const match = line.match(/UNIDAD \d+\s*[—-]\s*([^(]+)/);
                if (match) {
                    const unitName = match[1].trim();
                    currentUnitSlug = slugMapping[unitName];
                    console.log(`Cargando unidad: ${unitName} -> ${currentUnitSlug}`);
                }
                continue;
            }

            if (line.startsWith('**Pregunta')) {
                if (currentQuestion && currentUnitSlug) {
                    await insertQuestion(currentQuestion, unitIdsBySlug[currentUnitSlug]);
                    totalPreguntas++;
                }
                currentQuestion = { enunciado: '', opciones: [], correcta: '' };
                continue;
            }

            if (currentQuestion) {
                if (line.match(/^[A-D]\)/)) {
                    currentQuestion.opciones.push({
                        id: line[0],
                        texto: line.substring(2).trim()
                    });
                } else if (line.startsWith('**Correcta:')) {
                    currentQuestion.correcta = line.match(/Correcta:\s*([A-D])/)[1];
                } else if (line && !line.startsWith('---') && !line.startsWith('#')) {
                    if (!currentQuestion.enunciado) currentQuestion.enunciado = line;
                }
            }
        }
        // Last one
        if (currentQuestion && currentUnitSlug) {
            await insertQuestion(currentQuestion, unitIdsBySlug[currentUnitSlug]);
            totalPreguntas++;
        }
    }

    console.log(`\n🎉 PROCESO COMPLETADO. Total preguntas insertadas: ${totalPreguntas}`);
}

async function insertQuestion(q, unitId) {
    if (!unitId || !q.enunciado || q.opciones.length === 0) return;

    // Check if exists
    const { data: exist } = await supabase.from('preguntas')
        .select('id')
        .eq('entidad_id', unitId)
        .eq('enunciado_es', q.enunciado)
        .maybeSingle();

    if (!exist) {
        await supabase.from('preguntas').insert({
            entidad_tipo: 'unidad',
            entidad_id: unitId,
            tipo_pregunta: 'opcion_multiple',
            enunciado_es: q.enunciado,
            enunciado_eu: q.enunciado, // Fallback a español si no hay eu en MD
            opciones_json: q.opciones,
            respuesta_correcta: q.correcta,
            puntos: 1,
            categoria: 'teoria'
        });
    }
}

run().catch(err => {
    console.error('❌ FATAL ERROR:', err);
});
