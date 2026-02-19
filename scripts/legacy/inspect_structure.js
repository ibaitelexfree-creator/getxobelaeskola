
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envConfig = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        if (key && value && !key.startsWith('#')) {
            envConfig[key] = value;
        }
    }
});

const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

async function inspectStructure() {
    console.log('Fetching Course 1 structure...');

    // Assuming there is a course with 'Iniciación' in title or similar
    const { data: courses, error: courseError } = await supabase
        .from('cursos')
        .select('id, titulo, nivel_id, slug')
        .ilike('titulo', '%Iniciación%'); // or just fetch all

    if (courseError) {
        console.error('Error fetching courses:', courseError);
        return;
    }

    if (!courses || courses.length === 0) {
        console.log('No courses found. Fetching all courses...');
        const { data: allCourses } = await supabase.from('cursos').select('id, titulo, slug');
        console.log('All courses:', allCourses);
        return;
    }

    console.log('Found courses:', courses);

    const courseId = courses[0].id; // Assuming first one is the target
    console.log(`Inspecting Modules for Course: ${courses[0].titulo} (${courseId})`);

    const { data: modules, error: moduleError } = await supabase
        .from('modulos')
        .select('id, titulo, orden')
        .eq('curso_id', courseId)
        .order('orden');

    if (moduleError) {
        console.error('Error fetching modules:', moduleError);
        return;
    }

    console.log(`Found ${modules.length} modules.`);

    for (const mod of modules) {
        const { data: units, error: unitError } = await supabase
            .from('unidades_didacticas')
            .select('id, titulo, orden')
            .eq('modulo_id', mod.id)
            .order('orden');

        if (unitError) {
            console.error(`Error fetching units for module ${mod.titulo}:`, unitError);
        } else {
            console.log(`  Module: ${mod.titulo} (${mod.id}) - ${units.length} units`);
        }
    }
}

inspectStructure();
