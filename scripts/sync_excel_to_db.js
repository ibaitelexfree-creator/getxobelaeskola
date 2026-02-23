/**
 * Run platform redesign migration directly via Supabase client API
 * Since we can't run raw SQL via RPC, we use the client API for inserts/updates
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
    console.log('🔄 Phase 1: Platform Redesign Migration\n');

    // ==========================================
    // 1. FIX BONOS DATA (Excel: 5 salidas each)
    // ==========================================
    console.log('1️⃣  Fixing Bonos data...');

    const { data: allBonos } = await supabase.from('tipos_bono').select('id, nombre');
    for (const b of allBonos || []) {
        if (b.nombre.includes('Vela Ligera')) {
            await supabase.from('tipos_bono').update({ horas_totales: 5, precio: 150, descripcion: '5 salidas de navegación en vela ligera' }).eq('id', b.id);
            console.log('  ✅ Fixed Bono Vela Ligera -> 5 salidas, 150€');
        } else if (b.nombre.includes('Windsurf')) {
            await supabase.from('tipos_bono').update({ horas_totales: 5, precio: 130, descripcion: '5 salidas de windsurf' }).eq('id', b.id);
            console.log('  ✅ Fixed Bono Windsurf -> 5 salidas, 130€');
        } else if (b.nombre.includes('J80')) {
            await supabase.from('tipos_bono').update({ horas_totales: 5, precio: 150, nombre: 'Bono J80 5 Salidas', descripcion: '5 salidas en J80' }).eq('id', b.id);
            console.log('  ✅ Fixed Bono J80 -> 5 salidas, 150€');
        }
    }

    // ==========================================
    // 2. ADD MISSING COURSES (Windsurf variants)
    // ==========================================
    console.log('\n2️⃣  Adding missing courses...');

    const { data: windsurfCat } = await supabase.from('categorias').select('id').eq('slug', 'windsurf').single();
    const windsurfCatId = windsurfCat?.id;

    const missingCourses = [
        {
            nombre_es: 'Windsurf 3 Sesiones',
            nombre_eu: 'Windsurf 3 Saio',
            slug: 'windsurf-3-sesiones',
            descripcion_es: 'Pack de 3 sesiones de windsurf de 2 horas cada una. Ideal para practicar y mejorar.',
            descripcion_eu: '3 windsurf saioko paketea (2 ordu saio bakoitzeko). Praktikatzeko eta hobetzeko aproposa.',
            precio: 100, duracion_h: 6, nivel: 'iniciacion',
            categoria_id: windsurfCatId, activo: true, visible: true
        },
        {
            nombre_es: 'Windsurf 1 Sesión',
            nombre_eu: 'Windsurf Saio 1',
            slug: 'windsurf-1-sesion',
            descripcion_es: 'Sesión individual de windsurf de 2 horas. Perfecto para probar.',
            descripcion_eu: 'Windsurf saio bakarra (2 ordu). Probatzeko bikaina.',
            precio: 40, duracion_h: 2, nivel: 'iniciacion',
            categoria_id: windsurfCatId, activo: true, visible: true
        },
    ];

    for (const c of missingCourses) {
        const { data: existing } = await supabase.from('cursos').select('id').eq('slug', c.slug).maybeSingle();
        if (!existing) {
            const { error } = await supabase.from('cursos').insert(c);
            console.log(error ? `  ❌ ${c.nombre_es}: ${error.message}` : `  ✅ Added ${c.nombre_es}`);
        } else {
            console.log(`  ⏭️  ${c.nombre_es} already exists`);
        }
    }

    // ==========================================
    // 3. ADD MISSING RENTAL/MOORING SERVICES
    // ==========================================
    console.log('\n3️⃣  Adding missing services...');

    const missingServices = [
        {
            nombre_es: 'Omega/Raquero sin patrón', nombre_eu: 'Omega/Raquero patron gabe',
            slug: 'alquiler-omega-sin-patron', categoria: 'alquileres', precio_base: 140,
            descripcion_es: 'Navega a bordo de un velero clásico sin patrón. Tripulación mínima de 3 personas.',
            descripcion_eu: 'Nabigatu bela ontzi klasiko batean patron gabe. Gutxieneko tripulazioa 3 pertsona.',
            activo: true, opciones: []
        },
        {
            nombre_es: 'Atraque Windsurf', nombre_eu: 'Windsurf Atrakatzea',
            slug: 'atraque-windsurf', categoria: 'atraques', precio_base: 30,
            descripcion_es: 'Amarre mensual para tabla de windsurf. Matrícula: 50€.',
            descripcion_eu: 'Hilabeteko amarratzea windsurf taularentzat. Matrikula: 50€.',
            activo: true, opciones: []
        },
        {
            nombre_es: 'Atraque Piragua', nombre_eu: 'Piragua Atrakatzea',
            slug: 'atraque-piragua', categoria: 'atraques', precio_base: 25,
            descripcion_es: 'Amarre mensual para piragua. Matrícula: 50€.',
            descripcion_eu: 'Hilabeteko amarratzea piraguarentzat. Matrikula: 50€.',
            activo: true, opciones: []
        },
        {
            nombre_es: 'Cumpleaños Bigsub', nombre_eu: 'Bigsub Urtebetetzea',
            slug: 'cumple-bigsub', categoria: 'eventos', precio_base: 13,
            descripcion_es: 'Celebra tu cumpleaños con una aventura en Bigsub. Mínimo 12 participantes. Sin fianza.',
            descripcion_eu: 'Ospatu zure urtebetetzea Bigsub abentura batekin. Gutxienez 12 parte-hartzaile. Fidantzarik gabe.',
            activo: true, opciones: []
        },
        {
            nombre_es: 'Alquiler de Espacio', nombre_eu: 'Espazio Alokairua',
            slug: 'alquiler-espacio-eventos', categoria: 'eventos', precio_base: 150,
            descripcion_es: 'Alquiler de espacio para eventos (16:30-20:30). Fianza 100€.',
            descripcion_eu: 'Espazioa alokatzea ekitaldietarako (16:30-20:30). 100€ fidantza.',
            activo: true, opciones: []
        },
    ];

    for (const s of missingServices) {
        const { data: existing } = await supabase.from('servicios_alquiler').select('id').eq('slug', s.slug).maybeSingle();
        if (!existing) {
            const { error } = await supabase.from('servicios_alquiler').insert(s);
            console.log(error ? `  ❌ ${s.nombre_es}: ${error.message}` : `  ✅ Added ${s.nombre_es}`);
        } else {
            console.log(`  ⏭️  ${s.nombre_es} already exists`);
        }
    }

    // ==========================================
    // 4. CREATE TIPOS_MEMBRESIA TABLE + DATA
    // ==========================================
    console.log('\n4️⃣  Adding membership tiers...');

    // Check if table exists by trying to query it
    const { error: tableCheck } = await supabase.from('tipos_membresia').select('id').limit(1);

    if (tableCheck && tableCheck.code === '42P01') {
        console.log('  ⚠️  tipos_membresia table does not exist yet.');
        console.log('  📋 Please run the SQL migration manually in Supabase Dashboard:');
        console.log('     supabase/migrations/20260221_platform_redesign.sql (CREATE TABLE section)');
    } else {
        const membershipTiers = [
            { nombre: 'Socia Básica', nombre_eu: 'Oinarrizko Bazkidea', precio_anual: 630, precio_mensual: 70, beneficio: '30 salidas', beneficio_eu: '30 irteera', max_salidas: 30, incluye_entrenamientos: false, categoria: 'vela', orden: 1, activo: true },
            { nombre: 'Socia Entrenamientos', nombre_eu: 'Entrenamendu Bazkidea', precio_anual: 1000, precio_mensual: 110, beneficio: '3 entrenamientos/semana', beneficio_eu: '3 entrenamendu/astean', max_salidas: null, incluye_entrenamientos: true, categoria: 'vela', orden: 2, activo: true },
            { nombre: 'Socia Premium', nombre_eu: 'Premium Bazkidea', precio_anual: 1000, precio_mensual: 110, beneficio: 'Salidas ilimitadas', beneficio_eu: 'Irteera mugagabeak', max_salidas: null, incluye_entrenamientos: false, categoria: 'vela', orden: 3, activo: true },
            { nombre: 'Socia Premium+', nombre_eu: 'Premium+ Bazkidea', precio_anual: 1200, precio_mensual: null, beneficio: 'Entrenamientos y salidas ilimitadas', beneficio_eu: 'Entrenamendu eta irteera mugagabeak', max_salidas: null, incluye_entrenamientos: true, categoria: 'vela', orden: 4, activo: true },
            { nombre: 'Socia Básica Windsurf', nombre_eu: 'Oinarrizko Windsurf Bazkidea', precio_anual: 600, precio_mensual: 55, beneficio: '12h/mes', beneficio_eu: '12h/hilabete', max_salidas: null, incluye_entrenamientos: false, categoria: 'windsurf', orden: 5, activo: true },
        ];

        for (const m of membershipTiers) {
            const { data: ex } = await supabase.from('tipos_membresia').select('id').ilike('nombre', `%${m.nombre}%`).maybeSingle();
            if (!ex) {
                const { error } = await supabase.from('tipos_membresia').insert(m);
                console.log(error ? `  ❌ ${m.nombre}: ${error.message}` : `  ✅ Added ${m.nombre}`);
            } else {
                console.log(`  ⏭️  ${m.nombre} already exists`);
            }
        }
    }

    // ==========================================
    // 5. VALIDATE
    // ==========================================
    console.log('\n' + '='.repeat(50));
    console.log('🔍 VALIDATION REPORT\n');

    let total = 0, matched = 0;

    // Validate courses
    const excelCourses = [
        { slug: 'campus-verano-getxo', nombre: 'Campus Verano (Emp)', precio: 130 },
        { slug: 'campus-verano-external', nombre: 'Campus Verano (Ext)', precio: 140 },
        { slug: 'iniciacion-adultos', nombre: 'Iniciación Adultos', precio: 180 },
        { slug: 'tecnificacion-adultos', nombre: 'Tecnificación', precio: 150 },
        { slug: 'konpondu', nombre: 'Konpondu', precio: 100 },
        { slug: 'windsurf-iniciacion', nombre: 'Windsurf Iniciación', precio: 150 },
        { slug: 'windsurf-campus', nombre: 'Windsurf Campus', precio: 250 },
        { slug: 'windsurf-3-sesiones', nombre: 'Windsurf 3 Sesiones', precio: 100 },
        { slug: 'windsurf-1-sesion', nombre: 'Windsurf 1 Sesión', precio: 40 },
    ];

    console.log('📚 Cursos:');
    for (const c of excelCourses) {
        total++;
        const { data } = await supabase.from('cursos').select('precio').eq('slug', c.slug).maybeSingle();
        if (data && Number(data.precio) === c.precio) { matched++; console.log(`  ✅ ${c.nombre}`); }
        else if (data) { console.log(`  ⚠️  ${c.nombre}: precio=${data.precio} (expected ${c.precio})`); }
        else { console.log(`  ❌ ${c.nombre} MISSING`); }
    }

    // Validate alquileres
    const excelAlq = [
        { slug: 'alquiler-j80-patron', nombre: 'J-80 c/patrón', precio: 250 },
        { slug: 'alquiler-j80-sin-patron', nombre: 'J-80 s/patrón', precio: 180 },
        { slug: 'alquiler-omega-patron', nombre: 'Omega c/patrón', precio: 200 },
        { slug: 'alquiler-omega-sin-patron', nombre: 'Omega s/patrón', precio: 140 },
        { slug: 'alquiler-420-pro', nombre: '420', precio: 80 },
        { slug: 'alquiler-laser-pro', nombre: 'Laser', precio: 45 },
        { slug: 'alquiler-windsurf-pro', nombre: 'Windsurf', precio: 40 },
        { slug: 'alquiler-bigsub-group', nombre: 'Bigsub', precio: 80 },
        { slug: 'alquiler-tarpon-patron', nombre: 'Tarpon', precio: 200 },
        { slug: 'atraque-velero', nombre: 'Atraque Velero', precio: 50 },
        { slug: 'atraque-windsurf', nombre: 'Atraque Windsurf', precio: 30 },
        { slug: 'atraque-piragua', nombre: 'Atraque Piragua', precio: 25 },
        { slug: 'cumple-navegacion', nombre: 'Cumple Navegación', precio: 14 },
        { slug: 'cumple-bigsub', nombre: 'Cumple Bigsub', precio: 13 },
        { slug: 'alquiler-espacio-eventos', nombre: 'Espacio Eventos', precio: 150 },
    ];

    console.log('\n⛵ Servicios:');
    for (const a of excelAlq) {
        total++;
        const { data } = await supabase.from('servicios_alquiler').select('precio_base').eq('slug', a.slug).maybeSingle();
        if (data && Number(data.precio_base) === a.precio) { matched++; console.log(`  ✅ ${a.nombre}`); }
        else if (data) { console.log(`  ⚠️  ${a.nombre}: precio=${data.precio_base} (expected ${a.precio})`); }
        else { console.log(`  ❌ ${a.nombre} MISSING`); }
    }

    console.log(`\n📊 Total: ${total} | Matched: ${matched} | Rate: ${((matched / total) * 100).toFixed(1)}%`);
}

run().catch(console.error);
