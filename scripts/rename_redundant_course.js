
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if available
const envPath = path.join(process.cwd(), '.env.local');
const env = {};

if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^"(.*)"$/, '$1');
        }
    });
} else {
    // Fallback to process.env if running in an environment where vars are already set
    Object.assign(env, process.env);
}

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local or environment');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndRenameCourses() {
    console.log('Checking for redundant course names...');

    // 1. Fetch all levels
    const { data: levels, error: levelsError } = await supabase
        .from('niveles_formacion')
        .select('id, slug, nombre_es, nombre_eu');

    if (levelsError) {
        console.error('Error fetching levels:', levelsError);
        return;
    }

    // 2. Fetch all courses with nivel_formacion_id
    const { data: courses, error: coursesError } = await supabase
        .from('cursos')
        .select('id, slug, nombre_es, nombre_eu, nivel_formacion_id');

    if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        return;
    }

    console.log(`Found ${levels.length} levels and ${courses.length} courses.`);

    // 3. Iterate through each level
    for (const level of levels) {
        const matchingCourses = courses.filter(c => c.nivel_formacion_id === level.id);

        if (matchingCourses.length === 0) {
            // No course for this level yet
            continue;
        } else if (matchingCourses.length === 1) {
            const course = matchingCourses[0];

            // Check for mismatches
            const mismatchEs = course.nombre_es !== level.nombre_es;
            const mismatchEu = course.nombre_eu !== level.nombre_eu;
            const mismatchSlug = course.slug !== level.slug;

            if (mismatchEs || mismatchEu || mismatchSlug) {
                console.log(`\nMismatch found for Level: "${level.nombre_es}" (${level.slug})`);
                console.log(`  Current Course: "${course.nombre_es}" (${course.slug})`);
                console.log(`  Expected:       "${level.nombre_es}" (${level.slug})`);

                // Update the course
                const { error: updateError } = await supabase
                    .from('cursos')
                    .update({
                        nombre_es: level.nombre_es,
                        nombre_eu: level.nombre_eu,
                        slug: level.slug
                    })
                    .eq('id', course.id);

                if (updateError) {
                    console.error('  Error updating course:', updateError);
                } else {
                    console.log('  ✓ Updated course to match level.');
                }
            }
        } else {
            // Multiple courses for this level
            // Log info but do not touch
            console.log(`\nInfo: Level "${level.nombre_es}" has ${matchingCourses.length} courses. Skipping auto-rename.`);
            matchingCourses.forEach(c => console.log(`  - ${c.nombre_es} (${c.slug})`));
        }
    }

    console.log('\nDone.');
}

checkAndRenameCourses();
