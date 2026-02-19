
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envLocalPath = path.join(process.cwd(), '.env.local');
    const envPath = path.join(process.cwd(), '.env');
    let content = '';

    if (fs.existsSync(envLocalPath)) {
        content = fs.readFileSync(envLocalPath, 'utf8');
    } else if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf8');
    }

    const lines = content.split('\n');
    for (const line of lines) {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^"(.*)"$/, '$1');
            if (key && value) {
                process.env[key] = value;
            }
        }
    }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSkills() {
    console.log("--- TEST SKILLS LOGIC (Dummy Course) ---");

    // 1. Get/Create User
    const email = 'test_skills_dummy@example.com';
    let userId = null;
    const { data: { users } } = await supabase.auth.admin.listUsers();
    if (users) {
        const found = users.find(u => u.email === email);
        if (found) userId = found.id;
    }
    if (!userId) {
        const { data: newUser } = await supabase.auth.admin.createUser({
            email: email,
            password: 'password123',
            email_confirm: true
        });
        userId = newUser.user.id;
    }

    // Create Profile
    await supabase.from('profiles').upsert({
        id: userId,
        email: email,
        rol: 'alumno',
        nombre: 'Test',
        apellidos: 'Dummy User'
    });

    // 2. Create Dummy Course 'iniciacion-vela-ligera' and Nivel 1
    // We need a level ID. Let's find level 1.
    const { data: nivel1 } = await supabase.from('niveles_formacion').select('id').eq('nivel_numero', 1).single();
    if (!nivel1) {
        console.error("Nivel 1 not found!"); // Should exist from seeds
        return;
    }
    const nivelId = nivel1.id;

    // Create Course
    const dummySlug = 'iniciacion-vela-ligera';
    const { data: course, error: cError } = await supabase.from('cursos').insert({
        slug: dummySlug,
        nombre_es: 'Iniciación Vela Ligera (Dummy)',
        nivel_id: nivelId,
        orden: 999,
        publicado: false
    }).select().single();

    // Handle constraint error if exists (maybe it exists already?)
    let courseId;
    if (cError) {
        if (cError.code === '23505') { // Unique violation
            const { data: existing } = await supabase.from('cursos').select('id').eq('slug', dummySlug).single();
            courseId = existing.id;
        } else {
            console.error("Error creating dummy course:", cError);
            return;
        }
    } else {
        courseId = course.id;
    }

    // 3. Create Dummy Module 1
    const { data: module1, error: mError } = await supabase.from('modulos').insert({
        curso_id: courseId,
        nombre_es: 'Modulo 1 Dummy',
        orden: 1,
    }).select().single();

    let moduleId;
    if (mError) {
        if (mError.code === '23505') {
            const { data: existingM } = await supabase.from('modulos').select('id').eq('curso_id', courseId).eq('orden', 1).single();
            moduleId = existingM.id;
        } else {
            console.error("Error creating dummy module:", mError);
            return;
        }
    } else {
        moduleId = module1.id;
    }

    // 4. Clear old data
    await supabase.from('habilidades_alumno').delete().eq('alumno_id', userId);
    await supabase.from('progreso_alumno').delete().eq('alumno_id', userId);

    // 5. Complete Module -> Trigger Skill
    console.log("Completing module...");
    const { error: pError } = await supabase.from('progreso_alumno').insert({
        alumno_id: userId,
        entidad_id: moduleId,
        tipo_entidad: 'modulo',
        estado: 'completado',
        updated_at: new Date()
    });

    if (pError) console.error("Progress Error:", pError);

    // 6. Check Skill
    console.log("Checking skill...");
    const { data: skills } = await supabase.rpc('obtener_habilidades_alumno', { p_alumno_id: userId });

    const marinero = skills.find(s => s.slug === 'marinero-agua-dulce');
    if (marinero && marinero.obtenida) {
        console.log("✅ SUCCESS: Skill granted correctly via dummy course.");
    } else {
        console.error("❌ FAILURE: Skill not granted.");
    }

    // Cleanup (optional: delete dummy course/module/user)
    // await supabase.from('modulos').delete().eq('id', moduleId);
    // await supabase.from('cursos').delete().eq('id', courseId);
}

testSkills();
