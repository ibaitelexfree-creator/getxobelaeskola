
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim().replace(/"/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function setupGamification() {
    console.log('🚀 Setting up Gamification & Content for Level 1...');

    // 1. Get IDs
    const { data: curso } = await supabase.from('cursos').select('id').eq('slug', 'iniciacion-vela').single();
    if (!curso) {
        // Try other slug
        const { data: curso2 } = await supabase.from('cursos').select('id, slug').ilike('slug', '%iniciacion%').limit(1).single();
        if (curso2) {
            console.log(`Using course: ${curso2.slug}`);
            return runWithCourse(curso2.id);
        }
        console.error('❌ Course not found');
        return;
    }
    await runWithCourse(curso.id);
}

async function runWithCourse(cursoId) {
    const { data: modulos } = await supabase.from('modulos').select('id, nombre_es').eq('curso_id', cursoId);
    const m1 = modulos.find(m => m.nombre_es.includes('Introducción'));
    const m2 = modulos.find(m => m.nombre_es.includes('Navegación'));
    const m3 = modulos.find(m => m.nombre_es.includes('Técnica y Maniobras'));
    const m4 = modulos.find(m => m.nombre_es.includes('Seguridad Avanzada'));

    if (!m1 || !m2 || !m3 || !m4) {
        console.error('❌ Some modules are missing');
        console.log('Found modules:', modulos.map(m => m.nombre_es));
        return;
    }

    // 2. Create Badges (Logros)
    console.log('🏅 Creating/Updating Badges...');
    const logros = [
        {
            slug: 'logro-m1-completo',
            nombre_es: 'Grumete en Prácticas',
            nombre_eu: 'Praktiketako Grumetea',
            descripcion_es: 'Has completado el Módulo 1 y preparado tu equipo de aventura.',
            descripcion_eu: '1. modulua osatu duzu eta zure abentura-ekipoa prestatu duzu.',
            icono: '🎒',
            categoria: 'progreso',
            rareza: 'comun',
            puntos: 50,
            condicion_json: { tipo: 'modulo_completado', modulo_id: m1.id }
        },
        {
            slug: 'logro-m2-completo',
            nombre_es: 'Señor de los Vientos',
            nombre_eu: 'Haizeen Jauna',
            descripcion_es: 'Entiendes la física del viento y las velas.',
            descripcion_eu: 'Haizearen eta belen fisika ulertzen duzu.',
            icono: '🌬️',
            categoria: 'progreso',
            rareza: 'poco_comun',
            puntos: 75,
            condicion_json: { tipo: 'modulo_completado', modulo_id: m2.id }
        },
        {
            slug: 'logro-m3-completo',
            nombre_es: 'Tripulante Diestro',
            nombre_eu: 'Tripulatzaile Trebea',
            descripcion_es: 'Dominas las maniobras básicas y el equilibrio a bordo.',
            descripcion_eu: 'Oinarrizko manobrak eta ontziko oreka menderatzen dituzu.',
            icono: '⛵',
            categoria: 'progreso',
            rareza: 'poco_comun',
            puntos: 100,
            condicion_json: { tipo: 'modulo_completado', modulo_id: m3.id }
        },
        {
            slug: 'logro-m4-completo',
            nombre_es: 'Guardián de la Flota',
            nombre_eu: 'Flotako Zaindaria',
            descripcion_es: 'Eres un experto en seguridad y reglamento náutico.',
            descripcion_eu: 'Segurtasunean eta araudi nautikoan aditua zara.',
            icono: '🛡️',
            categoria: 'progreso',
            rareza: 'raro',
            puntos: 150,
            condicion_json: { tipo: 'modulo_completado', modulo_id: m4.id }
        },
        {
            slug: 'logro-iniciacion-oro',
            nombre_es: 'Grumete de Primera',
            nombre_eu: 'Lehen Mailako Grumetea',
            descripcion_es: '¡Felicidades! Has completado el Nivel 1 y estás listo para mayores desafíos.',
            descripcion_eu: 'Zorionak! 1. maila osatu duzu eta erronka handiagoetarako prest zaude.',
            icono: '🏆',
            categoria: 'progreso',
            rareza: 'legendario',
            puntos: 500,
            condicion_json: { tipo: 'nivel_especifico_slug', slug: 'iniciacion' }
        }
    ];

    for (const logro of logros) {
        const { error } = await supabase.from('logros').upsert(logro, { onConflict: 'slug' });
        if (error) console.error(`❌ Error with badge ${logro.slug}:`, error.message);
        else console.log(`✅ Badge ${logro.slug} ready.`);
    }

    // 3. Create Questions for Module 4 examen
    console.log('❓ Creating Questions for Module 4...');
    const preguntas = [
        {
            entidad_tipo: 'modulo',
            entidad_id: m4.id,
            tipo_pregunta: 'opcion_multiple',
            enunciado_es: 'Si ves una luz roja en el mar por tu estribor (derecha), ¿qué significa?',
            enunciado_eu: 'Itsasoan zure istriborretik (eskumaldetik) argi gorri bat ikusten baduzu, zer esan nahi du?',
            opciones_json: [
                { id: '1', texto_es: 'Tienes preferencia', texto_eu: 'Lehentasuna duzu' },
                { id: '2', texto_es: 'Debes ceder el paso', texto_eu: 'Bidea eman behar duzu' },
                { id: '3', texto_es: 'Es un barco de pesca', texto_eu: 'Arrantza-ontzi bat da' }
            ],
            respuesta_correcta: '2',
            explicacion_es: 'Rojo significa que ves el babor de otro barco que tiene preferencia sobre ti.',
            explicacion_eu: 'Gorriak esan nahi du zure gaineko lehentasuna duen beste ontzi baten ababorra ikusten duzula.',
            dificultad: 'intermedio',
            categoria: 'seguridad'
        },
        {
            entidad_tipo: 'modulo',
            entidad_id: m4.id,
            tipo_pregunta: 'opcion_multiple',
            enunciado_es: '¿Por qué lado debemos aproximarnos para rescatar a un hombre al agua?',
            enunciado_eu: 'Zein aldetik hurbildu behar dugu uretara eroritako gizon bat erreskatatzeko?',
            opciones_json: [
                { id: '1', texto_es: 'Barlovento (por donde viene el viento)', texto_eu: 'Haizealde (haizea datorren lekutik)' },
                { id: '2', texto_es: 'Sotavento (dejando el barco entre el viento y la víctima)', texto_eu: 'Haizebe (ontzia haizearen eta biktimaren artean utziz)' },
                { id: '3', texto_es: 'Por la popa directamente', texto_eu: 'Popatik zuzenean' }
            ],
            respuesta_correcta: '2',
            explicacion_es: 'Aproximarse por sotavento evita que el barco caiga encima de la víctima por efecto del viento.',
            explicacion_eu: 'Haizebetik hurbiltzeak ontzia haizearen eraginez biktimaren gainera erortzea eragozten du.',
            dificultad: 'avanzado',
            categoria: 'seguridad'
        }
    ];

    for (const preg of preguntas) {
        // Use direct insert and ignore errors about missing table to see if it eventually works
        const { error } = await supabase.from('preguntas').insert(preg);
        if (error) {
            console.error(`❌ Error with question:`, error.message);
            if (error.code === 'PGRST204' || error.code === 'PGRST205') {
                console.log('PostgREST schema cache might be stale. Trying with RPC...');
                // Fallback to exec_sql if available
                const sql = `INSERT INTO public.preguntas (entidad_tipo, entidad_id, tipo_pregunta, enunciado_es, enunciado_eu, opciones_json, respuesta_correcta, explicacion_es, explicacion_eu, dificultad, categoria) VALUES ('${preg.entidad_tipo}', '${preg.entidad_id}', '${preg.tipo_pregunta}', '${preg.enunciado_es.replace(/'/g, "''")}', '${preg.enunciado_eu.replace(/'/g, "''")}', '${JSON.stringify(preg.opciones_json)}', '${preg.respuesta_correcta}', '${preg.explicacion_es.replace(/'/g, "''")}', '${preg.explicacion_eu.replace(/'/g, "''")}', '${preg.dificultad}', '${preg.categoria}');`;
                const { error: rpcErr } = await supabase.rpc('exec_sql', { sql_query: sql });
                if (rpcErr) console.error('RPC also failed:', rpcErr.message);
                else console.log('✅ Question added via RPC.');
            }
        } else {
            console.log(`✅ Question added via PostgREST.`);
        }
    }

    // 4. Create Evaluation for Module 4
    console.log('📝 Creating Evaluation for Module 4...');
    const evaluacion = {
        tipo: 'examen_modulo',
        entidad_tipo: 'modulo',
        entidad_id: m4.id,
        titulo_es: 'Examen de Seguridad y Reglamento',
        titulo_eu: 'Segurtasun eta Araudi Azterketa',
        descripcion_es: 'Demuestra que estás listo para cuidar de tu tripulación.',
        descripcion_eu: 'Erakutsi zure tripulazioa zaintzeko prest zaudela.',
        num_preguntas: 10,
        nota_aprobado: 70.00,
        aleatorizar_preguntas: true
    };

    const { error: evError } = await supabase.from('evaluaciones').insert(evaluacion);
    if (evError) {
        console.error(`❌ Error with evaluation:`, evError.message);
        // Try update if it exists
        await supabase.from('evaluaciones').update(evaluacion).eq('entidad_id', m4.id);
    } else {
        console.log(`✅ Evaluation for Module 4 created.`);
    }

    console.log('✨ All done!');
}

setupGamification();
