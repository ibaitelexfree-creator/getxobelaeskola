import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    console.log('--- Starting Weekly Challenge Verification ---');

    try {
        // 1. Get a test user
        const { data: users, error: userError } = await supabase
            .from('profiles')
            .select('id, email')
            .limit(1);

        if (userError || !users || users.length === 0) {
            console.error('Could not find a user for testing:', userError);
            return;
        }

        const testUser = users[0];
        console.log(`Testing with user: ${testUser.email} (${testUser.id})`);

        // 2. Ensure Weekly Challenge Exists
        console.log('Calling get_or_create_weekly_challenge...');
        const { data: challenge, error: challengeError } = await supabase.rpc('get_or_create_weekly_challenge');

        if (challengeError) {
            console.error('Error creating challenge:', challengeError);
            return;
        }

        console.log('Active Challenge:', JSON.stringify(challenge, null, 2));

        const challengeId = challenge.id;
        const challengeType = challenge.template.type;
        console.log(`Challenge Type: ${challengeType}`);

        // 3. Clear existing progress for this challenge to start fresh
        /*
        await supabase
            .from('user_weekly_challenge_progress')
            .delete()
            .eq('user_id', testUser.id)
            .eq('challenge_id', challengeId);
        */
        // Actually, let's keep it additive.

        // 4. Simulate Progress based on Type
        if (challengeType === 'lesson_count') {
            console.log('Simulating Lesson Completion...');

            // Try to find a unit
            const { data: units } = await supabase.from('unidades_didacticas').select('id').limit(1);
            let unitId = units && units.length > 0 ? units[0].id : null;

            if (!unitId) {
                console.log('No units found. Creating a dummy unit if possible (might fail due to modules FK)...');
                // Creating dummy unit is hard due to FKs. Skipping if no units.
                console.warn('SKIPPING LESSON SIMULATION: No units found to link to.');
            } else {
                 console.log(`Using unit ID: ${unitId}`);
                 // Insert/Update progress
                 const { error: progError } = await supabase
                    .from('progreso_alumno')
                    .upsert({
                        alumno_id: testUser.id,
                        tipo_entidad: 'unidad',
                        entidad_id: unitId,
                        estado: 'completado',
                        porcentaje: 100
                    }, { onConflict: 'alumno_id, tipo_entidad, entidad_id' }); // Update if exists

                if (progError) console.error('Lesson simulation error:', progError);
            }

        } else if (challengeType === 'quiz_score') {
             console.log('Simulating Quiz Completion...');
             // Need valid evaluation ID.
             const { data: evals } = await supabase.from('evaluaciones').select('id').limit(1);
             let evalId = evals && evals.length > 0 ? evals[0].id : null;

             if (!evalId) {
                 console.warn('SKIPPING QUIZ SIMULATION: No evaluations found.');
             } else {
                 console.log(`Using evaluation ID: ${evalId}`);
                 const { error: quizError } = await supabase
                    .from('intentos_evaluacion')
                    .insert({
                        alumno_id: testUser.id,
                        evaluacion_id: evalId,
                        tipo: 'quiz_unidad',
                        estado: 'completado',
                        preguntas_json: [],
                        puntuacion: 95
                    });
                 if (quizError) console.error('Quiz simulation error:', quizError);
             }

        } else if (challengeType === 'logbook_entry') {
            console.log('Simulating Logbook Entry...');
            const { error: logError } = await supabase
                .from('bitacora_personal')
                .insert({
                    alumno_id: testUser.id,
                    contenido: 'Test Entry via Script',
                    estado_animo: 'confident'
                });

            if (logError) console.error('Logbook simulation error:', logError);
        }

        // 5. Verify Progress
        console.log('Verifying Progress...');
        // Wait a bit for triggers (though synchronous usually)
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data: progress, error: verifyError } = await supabase
            .from('user_weekly_challenge_progress')
            .select('*')
            .eq('user_id', testUser.id)
            .eq('challenge_id', challengeId);

        if (verifyError) {
            console.error('Error fetching progress:', verifyError);
        } else {
            console.log('User Progress Result:', progress);
            if (progress && progress.length > 0) {
                console.log('SUCCESS: Progress record found.');
                console.log(`Current Value: ${progress[0].current_value}`);
                console.log(`Completed: ${progress[0].completed}`);
            } else {
                console.log('WARNING: No progress record found.');
            }
        }

    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

main();
