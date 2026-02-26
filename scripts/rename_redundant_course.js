
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length === 2) {
        env[parts[0].trim()] = parts[1].trim();
    }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

<<<<<<< HEAD
function isRedundant(courseName, levelName, lang) {
    if (!courseName || !levelName) return false;
    if (courseName === levelName) return false;

    const extraWords = lang === 'es'
        ? ['Curso de ', ' Ligera', 'Curso ']
        : ['ko Ikastaroa', ' Ikastaroa', 'ko Ikastaro'];

    for (const extra of extraWords) {
        if (extra.startsWith(' ')) {
            if (courseName === levelName + extra) return true;
        } else {
            if (courseName === extra + levelName) return true;
        }
    }

    // Special case for Basque "ko" suffix which might change the ending of the level name
    // Example: "Bela Arina" -> "Bela Arineko Ikastaroa"
    if (lang === 'eu' && courseName.includes('Ikastaroa')) {
        const levelFirstWord = levelName.split(' ')[0];
        if (courseName.startsWith(levelFirstWord)) return true;
    }

    return false;
}

async function renameCourses() {
    console.log('Checking for redundant course names to match level names...');

    const { data: niveles, error: nError } = await supabase.from('niveles_formacion').select('*');
    if (nError) {
        console.error('Error fetching levels:', nError);
        return;
    }

    const { data: cursos, error: cError } = await supabase.from('cursos').select('*');
    if (cError) {
        console.error('Error fetching courses:', cError);
        return;
    }

    for (const level of niveles) {
        // Find courses for this level or that should be in this level
        const levelCourses = cursos.filter(c =>
            c.nivel_formacion_id === level.id ||
            c.slug === level.slug ||
            (c.nivel_formacion_id === null && c.nombre_es.includes(level.nombre_es))
        );

        for (const course of levelCourses) {
            const redundantEs = isRedundant(course.nombre_es, level.nombre_es, 'es');
            const redundantEu = isRedundant(course.nombre_eu, level.nombre_eu, 'eu');
            const needsLinking = course.nivel_formacion_id === null;

            if (redundantEs || redundantEu || needsLinking) {
                console.log(`\nPotential match found:`);
                console.log(`- Level: ${level.nombre_es} (${level.slug})`);
                console.log(`- Course: ${course.nombre_es} (${course.slug})`);

                const updates = {};
                if (redundantEs) {
                    updates.nombre_es = level.nombre_es;
                    console.log(`  * Will rename ES: "${course.nombre_es}" -> "${level.nombre_es}"`);
                }
                if (redundantEu) {
                    updates.nombre_eu = level.nombre_eu;
                    console.log(`  * Will rename EU: "${course.nombre_eu}" -> "${level.nombre_eu}"`);
                }
                if (needsLinking) {
                    updates.nivel_formacion_id = level.id;
                    console.log(`  * Will link to level ID: ${level.id}`);
                }

                // Generic slug redundancy check
                if (course.slug.endsWith('-ligera') && !level.slug.endsWith('-ligera')) {
                    const candidateSlug = course.slug.replace('-ligera', '');
                    if (candidateSlug === level.slug || candidateSlug === level.slug + '-vela') {
                         updates.slug = candidateSlug;
                         console.log(`  * Will update slug: "${course.slug}" -> "${updates.slug}"`);
                    }
                } else if (course.slug === 'vela-ligera' && level.slug === 'vela-ligera') {
                    // Already matches, no change needed for slug
                }

                if (Object.keys(updates).length > 0) {
                    const { error: uError } = await supabase
                        .from('cursos')
                        .update(updates)
                        .eq('id', course.id);

                    if (uError) {
                        console.error(`  X Error updating course ${course.id}:`, uError.message);
                    } else {
                        console.log(`  ✓ Successfully updated course.`);
                    }
                }
            }
        }
    }
    console.log('\nFinished checking courses.');
}

renameCourses();
=======
async function renameCourse() {
    console.log('Renaming course to match level name...');

    // Level: Iniciación a la Vela
    // Course: Iniciación a la Vela Ligera -> Iniciación a la Vela
    const { error } = await supabase
        .from('cursos')
        .update({
            nombre_es: 'Iniciación a la Vela',
            nombre_eu: 'Belaren Hasiera',
            slug: 'iniciacion-vela' // Matching the level slug more closely
        })
        .eq('slug', 'iniciacion-vela-ligera');

    if (error) console.error(error);
    else console.log('✓ Renamed course "Iniciación a la Vela Ligera" to "Iniciación a la Vela"');

    // Check others (although they have no courses yet, we should fix the logic if they are added later)
}

renameCourse();
>>>>>>> pr-286
