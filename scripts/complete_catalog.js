
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const missingItems = [
    // CURSOS
    {
        table: 'cursos',
        data: {
            nombre: "Konpondu (Taller de Reparación)",
            descripcion_es: "Aprende a mantener y reparar tu embarcación. Taller práctico de fibra, gelcoat y cabuyería.",
            descripcion_eu: "Ikasi zure ontzia mantentzen eta konpontzen. Zuntz, gelcoat eta kabuyeria tailer praktikoa.",
            precio: 50, // Estimado
            nivel: "Taller",
            duracion_h: 4,
            activo: true,
            visible: true
        }
    },
    // SERVICIOS (Alquiler/Eventos)
    {
        table: 'servicios_alquiler',
        data: {
            nombre_es: "Urtebetetxeak (Cumpleaños Náuticos)",
            nombre_eu: "Urtebetetxeak (Urtebetetze Nautikoak)",
            categoria: "eventos",
            slug: "cumpleanos-nauticos",
            precio_base: 150, // Pack base
            descripcion_es: "Celebra tu cumpleaños en el mar. Incluye navegación, juegos y merienda (opcional).",
            descripcion_eu: "Ospatu zure urtebetetzea itsasoan. Nabigazioa, jolasak eta askaria (aukerakoa) barne.",
            activo: true
        }
    },
    {
        table: 'servicios_alquiler',
        data: {
            nombre_es: "Atraque Transeúnte (< 8m)",
            nombre_eu: "Atraque Transeúnte (< 8m)",
            categoria: "atraques",
            slug: "atraque-transeunte-8m",
            precio_base: 25, // Día
            descripcion_es: "Atraque diario para embarcaciones de hasta 8 metros de eslora.",
            descripcion_eu: "Eguneko atrakatzea 8 metrora arteko ontzientzat.",
            activo: true
        }
    },
    {
        table: 'servicios_alquiler',
        data: {
            nombre_es: "Atraque Transeúnte (> 8m)",
            nombre_eu: "Atraque Transeúnte (> 8m)",
            categoria: "atraques",
            slug: "atraque-transeunte-12m",
            precio_base: 35, // Día
            descripcion_es: "Atraque diario para embarcaciones de más de 8 metros.",
            descripcion_eu: "Eguneko atrakatzea 8 metrotik gorako ontzientzat.",
            activo: true
        }
    }
];

async function addMissing() {
    console.log(`🚀 Añadiendo ${missingItems.length} ítems faltantes al catálogo...`);

    for (const item of missingItems) {
        // Simple check to avoid duplicates (by name/slug)
        let exists = false;
        if (item.table === 'cursos') {
            const { data } = await supabase.from('cursos').select('id').eq('nombre', item.data.nombre).single();
            exists = !!data;
        } else {
            const { data } = await supabase.from('servicios_alquiler').select('id').eq('slug', item.data.slug).single();
            exists = !!data;
        }

        if (exists) {
            console.log(`⚠️  ${item.data.nombre || item.data.nombre_es} ya existe. Saltando.`);
        } else {
            const { error } = await supabase.from(item.table).insert(item.data);
            if (error) {
                console.error(`❌ Error insertando ${item.data.nombre || item.data.slug}:`, error.message);
            } else {
                console.log(`✅ ${item.data.nombre || item.data.slug} creado correctamente.`);
            }
        }
    }

    console.log('🏁 Proceso de completado finalizado.');
}

addMissing();
