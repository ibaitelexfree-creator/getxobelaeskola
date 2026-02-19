
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

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Key.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSkills() {
    console.log("--- TEST SKILLS LOGIC (V2) ---");

    // 1. Get or Create Test User
    const email = 'test_skills_user_v3@example.com';
    let userId = null;

    const { data: { users }, error: authListError } = await supabase.auth.admin.listUsers();

    if (authListError) {
        // console.error("Error listing users:", authListError); 
    } else {
        const found = users.find(u => u.email === email);
        if (found) userId = found.id;
    }

    if (!userId) {
        console.log("Creating test user...");
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: email,
            password: 'password123',
            email_confirm: true
        });
        if (createError) {
            console.error("Error creating user:", createError);
            return;
        }
        userId = newUser.user.id;
    }
    console.log(`Test User ID: ${userId}`);

    // Update profile with correct columns
    const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        email: email,
        rol: 'alumno', // Use 'alumno' or 'student' depending on check constraint, usually 'alumno' in Spanish schema
        nombre: 'Test',
        apellidos: 'Skills User'
    });
    if (profileError) console.error("Profile upsert error:", profileError);


    // 2. Find "Iniciación" Course & Module
    // Check 'iniciacion-vela' first
    console.log("Searching for 'iniciacion-vela'...");
    let { data: course, error: courseError } = await supabase
        .from('cursos')
        .select('id, slug, modulos(id, orden, nombre_es)')
        .eq('slug', 'iniciacion-vela')
        .single();

    // If not found or no modules, try 'vela-ligera'
    if (!course) {
        console.log("'iniciacion-vela' not found, trying 'vela-ligera'...");
        const { data: course2 } = await supabase
            .from('cursos')
            .select('id, slug, modulos(id, orden, nombre_es)')
            .eq('slug', 'vela-ligera')
            .single();
        course = course2;
    }

    if (!course) {
        console.error("No suitable course found.");
        return;
    }

    console.log(`Using Course: ${course.slug}`);
    const module1 = course.modulos.find(m => m.orden === 1);
    if (!module1) {
        console.error("Module 1 not found in course");
        return;
    }
    console.log(`Found Module 1: ${module1.nombre_es} (${module1.id})`);


    // 3. Clear existing skills
    await supabase.from('habilidades_alumno').delete().eq('alumno_id', userId);
    await supabase.from('progreso_alumno').delete().eq('alumno_id', userId);


    // 4. Simulate Completing Module 1
    console.log("Simulating Module 1 Completion...");
    const { error: progressError } = await supabase.from('progreso_alumno').insert({
        alumno_id: userId,
        entidad_id: module1.id,
        tipo_entidad: 'modulo',
        estado: 'completado',
        updated_at: new Date()
    });

    if (progressError) {
        console.error("Error inserting progress:", progressError);
        return;
    }
    console.log("Progress inserted.");


    // 5. Verify Skill Grant
    console.log("Verifying Skill Grant...");
    const { data: skills, error: skillsError } = await supabase.rpc('obtener_habilidades_alumno', { p_alumno_id: userId });

    if (skillsError) {
        console.error("Error fetching skills:", skillsError);
    } else {
        const marinero = skills.find(s => s.slug === 'marinero-agua-dulce');
        if (marinero && marinero.obtenida) {
            console.log("✅ SUCCESS: Skill 'Marinero de Agua Dulce' granted!");
        } else {
            console.error("❌ FAILURE: Skill not granted.");
            console.log("Skills found:", skills.filter(s => s.obtenida).map(s => s.slug));
            console.log("Note: If failure, it might be due to slug mismatch in 'evaluar_habilidades' function.");
        }
    }

    // Cleanup
    // await supabase.auth.admin.deleteUser(userId);
}

testSkills();
