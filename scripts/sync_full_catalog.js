
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnv() {
    const envPath = path.join(process.cwd(), '.env');
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

const CATEGORIES = [
    { slug: 'infantiles', es: 'Cursos Infantiles', eu: 'Haurrentzako Ikastaroak' },
    { slug: 'adultos', es: 'Cursos Adultos', eu: 'Helduentzako Ikastaroak' },
    { slug: 'windsurf', es: 'Windsurf', eu: 'Windsurfa' },
    { slug: 'atraques', es: 'Atraques', eu: 'Atrakatzeak' },
    { slug: 'alquileres', es: 'Alquileres', eu: 'Alokairuak' },
    { slug: 'membresias', es: 'Tarifas Socias', eu: 'Bazkide Tarifak' },
    { slug: 'bonos', es: 'Bonos', eu: 'Bonuak' },
    { slug: 'eventos', es: 'Cumpleaños y Eventos', eu: 'Urtebetetzeak eta Ekitaldiak' }
];

const CURSOS = [
    // Infantiles
    {
        slug: 'campus-verano-getxo',
        categoria: 'infantiles',
        nombre_es: 'Campus Verano (Empadronados)',
        nombre_eu: 'Udako Campusa (Erroldatuak)',
        precio: 130,
        duracion_h: 20,
        nivel: 'iniciacion',
        descripcion_es: 'Campus de verano para niños y jóvenes de 5 a 21 años empadronados en Getxo.',
        descripcion_eu: '5 eta 21 urte bitarteko haur eta gazteentzako udako campusa, Getxon erroldatuta daudenentzat.'
    },
    {
        slug: 'campus-verano-external',
        categoria: 'infantiles',
        nombre_es: 'Campus Verano (No Empadronados)',
        nombre_eu: 'Udako Campusa (Erroldatu gabeak)',
        precio: 140,
        duracion_h: 20,
        nivel: 'iniciacion',
        descripcion_es: 'Campus de verano para niños y jóvenes de 5 a 21 años no empadronados en Getxo.',
        descripcion_eu: '5 eta 21 urte bitarteko haur eta gazteentzako udako campusa, Getxon erroldatu gabe daudenentzat.'
    },
    // Adultos
    {
        slug: 'iniciacion-adultos',
        categoria: 'adultos',
        nombre_es: 'Iniciación Adultos',
        nombre_eu: 'Helduentzako Hasiera',
        precio: 180,
        duracion_h: 12,
        nivel: 'iniciacion',
        descripcion_es: 'Curso de iniciación a la navegación para adultos.',
        descripcion_eu: 'Helduentzako nabigazio ikastaroa (hasiera).'
    },
    {
        slug: 'tecnificacion-adultos',
        categoria: 'adultos',
        nombre_es: 'Tecnificación Adultos',
        nombre_eu: 'Helduentzako Teknifikazioa',
        precio: 150,
        duracion_h: 8,
        nivel: 'intermedio',
        descripcion_es: 'Curso de perfeccionamiento y tecnificación para adultos.',
        descripcion_eu: 'Helduentzako hobekuntza eta teknifikazio ikastaroa.'
    },
    {
        slug: 'konpondu',
        categoria: 'adultos',
        nombre_es: 'Konpondu',
        nombre_eu: 'Konpondu',
        precio: 100,
        duracion_h: 8,
        nivel: 'intermedio',
        descripcion_es: 'Curso especializado en mantenimiento y reparación naviera.',
        descripcion_eu: 'Mantentze eta konponketa nautikoko ikastaro espezializatua.'
    },
    // Windsurf Courses
    {
        slug: 'windsurf-iniciacion',
        categoria: 'windsurf',
        nombre_es: 'Curso Iniciación Windsurf',
        nombre_eu: 'Windsurf Hasiera Ikastaroa',
        precio: 150,
        duracion_h: 10,
        nivel: 'iniciacion',
        descripcion_es: 'Aprende los fundamentos del windsurf en 5 sesiones de 2 horas.',
        descripcion_eu: 'Ikasi windsurfeko oinarriak 5 saiotan (2 ordu saio bakoitzeko).'
    },
    {
        slug: 'windsurf-campus',
        categoria: 'windsurf',
        nombre_es: 'Campus Windsurf',
        nombre_eu: 'Windsurf Campusa',
        precio: 250,
        duracion_h: 15,
        nivel: 'iniciacion',
        descripcion_es: 'Campamento intensivo de windsurf de 15 horas.',
        descripcion_eu: '15 orduko windsurf campus intentsiboa.'
    }
];

const RENTALS = [
    // Alquileres Pro
    {
        slug: 'alquiler-j80-patron',
        categoria: 'alquileres',
        nombre_es: 'J-80 con patrón',
        nombre_eu: 'J-80 patroiarekin',
        precio_base: 250,
        descripcion_es: 'Alquiler de velero J-80 con patrón profesional incluido (Media jornada - 4h).',
        descripcion_eu: 'J-80 belaontziaren alokairua patroi profesionalarekin (Egun erdia - 4h).'
    },
    {
        slug: 'alquiler-j80-sin-patron',
        categoria: 'alquileres',
        nombre_es: 'J-80 sin patrón',
        nombre_eu: 'J-80 patroi gabe',
        precio_base: 180,
        descripcion_es: 'Alquiler de velero J-80 para navegantes con titulación (Media jornada - 4h).',
        descripcion_eu: 'J-80 belaontziaren alokairua titulazioa dutenentzat (Egun erdia - 4h).'
    },
    {
        slug: 'alquiler-omega-patron',
        categoria: 'alquileres',
        nombre_es: 'Omega con patrón',
        nombre_eu: 'Omega patroiarekin',
        precio_base: 200,
        descripcion_es: 'Alquiler de embarcación colectiva Omega/Raquero con patrón (Media jornada - 4h).',
        descripcion_eu: 'Omega/Raquero ontzi kolektiboaren alokairua patroiarekin (Egun erdia - 4h).'
    },
    {
        slug: 'alquiler-420-pro',
        categoria: 'alquileres',
        nombre_es: '420',
        nombre_eu: '420',
        precio_base: 80,
        descripcion_es: 'Alquiler de embarcación 420 para 2 tripulantes (Media jornada - 4h).',
        descripcion_eu: '420 ontziaren alokairua 2 lagunentzako (Egun erdia - 4h).'
    },
    {
        slug: 'alquiler-laser-pro',
        categoria: 'alquileres',
        nombre_es: 'Laser',
        nombre_eu: 'Laser',
        precio_base: 45,
        descripcion_es: 'Alquiler de embarcación individual Laser (Media jornada - 4h).',
        descripcion_eu: 'Bakarkako Laser ontziaren alokairua (Egun erdia - 4h).'
    },
    {
        slug: 'alquiler-windsurf-pro',
        categoria: 'alquileres',
        nombre_es: 'Windsurf',
        nombre_eu: 'Windsurfa',
        precio_base: 40,
        descripcion_es: 'Alquiler de equipo de windsurf (Media jornada - 4h).',
        descripcion_eu: 'Windsurf ekipamenduaren alokairua (Egun erdia - 4h).'
    },
    {
        slug: 'alquiler-tarpon-patron',
        categoria: 'alquileres',
        nombre_es: 'Tarpon con patrón',
        nombre_eu: 'Tarpon patroiarekin',
        precio_base: 200,
        descripcion_es: 'Alquiler de Tarpon con patrón incluido (Sesión 2h).',
        descripcion_eu: 'Tarpon alokairua patroi barne (2 orduko saioa).'
    },
    // Atraques
    {
        slug: 'atraque-velero',
        categoria: 'atraques',
        nombre_es: 'Atraque Velero',
        nombre_eu: 'Belontzi Atrakatzea',
        precio_base: 50,
        descripcion_es: 'Servicio de atraque mensual para velero (Matrícula 50€).',
        descripcion_eu: 'Hileroko atrakatze zerbitzua belontziarentzat (Matrikula 50€).'
    },
    // Socias
    {
        slug: 'socia-premium',
        categoria: 'membresias',
        nombre_es: 'Socia Premium',
        nombre_eu: 'Bazkide Premium',
        precio_base: 110,
        descripcion_es: 'Salidas ilimitadas y máxima prioridad. Pago mensual.',
        descripcion_eu: 'Irteera mugagabeak eta lehentasun osoa. Hilabetero ordaintzea.'
    },
    // Bonos
    {
        slug: 'bono-vela-ligera',
        categoria: 'bonos',
        nombre_es: 'Bono Vela Ligera',
        nombre_eu: 'Bela Arina Bonua',
        precio_base: 150,
        descripcion_es: 'Pack de 5 salidas de vela ligera.',
        descripcion_eu: 'Bela arineko 5 irteerako paketea.'
    },
    // Eventos
    {
        slug: 'cumple-navegacion',
        categoria: 'eventos',
        nombre_es: 'Cumpleaños Navegación',
        nombre_eu: 'Nabigazio Urtebetetzea',
        precio_base: 14,
        descripcion_es: 'Celebración de cumpleaños con actividad de navegación (Precio por pax, min 12).',
        descripcion_eu: 'Urtebetetze ospakizuna nabigazio jarduerarekin (Prezioa pertsonako, gutxienez 12).'
    }
];

async function sync() {
    console.log('🚀 Iniciando sincronización del catálogo completo...');

    // 1. Sync Categories
    const { data: dbCats } = await supabase.from('categorias').select('*');
    const catMap = {};

    for (const cat of CATEGORIES) {
        const existing = dbCats.find(c => c.slug === cat.slug);
        if (existing) {
            catMap[cat.slug] = existing.id;
        } else {
            const { data, error } = await supabase.from('categorias').insert({
                slug: cat.slug,
                nombre_es: cat.es,
                nombre_eu: cat.eu
            }).select().single();
            if (data) catMap[cat.slug] = data.id;
        }
    }

    // 2. Sync Cursos
    for (const curso of CURSOS) {
        const { error } = await supabase.from('cursos').upsert({
            slug: curso.slug,
            nombre_es: curso.nombre_es,
            nombre_eu: curso.nombre_eu,
            descripcion_es: curso.descripcion_es,
            descripcion_eu: curso.descripcion_eu,
            precio: curso.precio,
            duracion_h: curso.duracion_h,
            nivel: curso.nivel,
            categoria_id: catMap[curso.categoria],
            activo: true,
            visible: true
        }, { onConflict: 'slug' });

        if (error) console.error(`Error syncing curso ${curso.slug}:`, error.message);
        else console.log(`✅ Curso sync: ${curso.slug}`);
    }

    // 3. Sync Rentals
    for (const rental of RENTALS) {
        const { error } = await supabase.from('servicios_alquiler').upsert({
            slug: rental.slug,
            nombre_es: rental.nombre_es,
            nombre_eu: rental.nombre_eu,
            descripcion_es: rental.descripcion_es,
            descripcion_eu: rental.descripcion_eu,
            precio_base: rental.precio_base,
            categoria: rental.categoria,
            activo: true
        }, { onConflict: 'slug' });

        if (error) console.error(`Error syncing rental ${rental.slug}:`, error.message);
        else console.log(`✅ Rental sync: ${rental.slug}`);
    }

    console.log('\n🎉 Sincronización finalizada.');
}

sync();
