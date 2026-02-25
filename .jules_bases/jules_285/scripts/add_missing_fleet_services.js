
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const newServices = [
    {
        nombre_es: "Laser (Standard / Radial)",
        nombre_eu: "Laser (Standard / Radial)",
        categoria: "veleros",
        slug: "alquiler-laser",
        imagen_url: "/images/laser.webp",
        precio_base: 35,
        descripcion_es: "Navegación individual en barco rápido y técnico. Ideal para perfeccionamiento y diversión.",
        descripcion_eu: "Bakarkako nabigazioa ontzi azkar eta teknikoan. Hobetzeko eta ondo pasatzeko aproposa.",
        opciones: [],
        activo: true
    },
    {
        nombre_es: "420 (Doble)",
        nombre_eu: "420 (Bikoitza)",
        categoria: "veleros",
        slug: "alquiler-420",
        imagen_url: "/images/420.webp",
        precio_base: 45,
        descripcion_es: "Barco escuela doble, perfecto para aprender a trabajar en equipo y maniobras con trapecio.",
        descripcion_eu: "Ontzi eskola bikoitza, talde-lana eta trapezio maniobrak ikasteko ezin hobea.",
        opciones: [],
        activo: true
    },
    {
        nombre_es: "Raquero / Omega (Colectivo)",
        nombre_eu: "Raquero / Omega (Taldeka)",
        categoria: "veleros",
        slug: "alquiler-raquero-omega",
        imagen_url: "/images/raquero.webp",
        precio_base: 80,
        descripcion_es: "Navegación estable y segura en grupo. Ideal para bautismos, familias o grupos de amigos.",
        descripcion_eu: "Taldeko nabigazio egonkor eta segurua. Bautismoetarako, familietarako edo lagun taldeetarako aproposa.",
        opciones: [
            { nombre: "Con Monitor / Patrón", precio_extra: 40 },
            { nombre: "Sin Patrón", precio_extra: 0 }
        ],
        activo: true
    }
];

async function addServices() {
    console.log(`🚀 Añadiendo ${newServices.length} servicios de flota ligera...`);

    for (const service of newServices) {
        // Check if exists
        const { data: existing } = await supabase.from('servicios_alquiler').select('id').eq('slug', service.slug).single();

        if (existing) {
            console.log(`⚠️  El servicio ${service.slug} ya existe. Saltando.`);
        } else {
            const { error } = await supabase.from('servicios_alquiler').insert(service);
            if (error) {
                console.error(`❌ Error insertando ${service.slug}:`, error.message);
            } else {
                console.log(`✅ ${service.slug} creado correctamente.`);
            }
        }
    }

    console.log('🏁 Proceso finalizado.');
}

addServices();
