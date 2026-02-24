
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('❌ No se encontró .env.local');
        process.exit(1);
    }
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

const seeds = [
    'supabase/seeds/001_curso_iniciacion.sql',
    'supabase/seeds/001b_curso1_unidades_restantes.sql',
    'supabase/seeds/001_questions_part1.sql',
    'supabase/seeds/002_questions_part2.sql',
    'supabase/seeds/003_questions_part3.sql',
    'supabase/seeds/004_questions_part4.sql',
    'supabase/seeds/004_evaluaciones_curso1.sql'
];

async function runSeeds() {
    console.log('🚀 Iniciando carga masiva de semillas (Curso 1)...');

    for (const seedPath of seeds) {
        const fullPath = path.join(process.cwd(), seedPath);
        if (!fs.existsSync(fullPath)) {
            console.warn(`⚠️  Salteando ${seedPath}: Archivo no encontrado`);
            continue;
        }

        console.log(`\n⏳ Ejecutando: ${seedPath}...`);
        const sql = fs.readFileSync(fullPath, 'utf8');

        // Intentamos usar una función RPC para ejecutar SQL si existe
        // Si no existe, dividimos y ejecutamos (aunque DO blocks fallarán si se dividen mal)
        // La mejor opción en Supabase remoto para DO blocks es usar el endpoint de SQL o una RPC exec_sql

        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            console.error(`❌ Error en ${seedPath}:`, error.message);

            if (error.message.includes('function "exec_sql" does not exist')) {
                console.log('💡 Tip: Debes crear la función exec_sql primero o usar el dashboard.');
                console.log('Intentado método alternativo para sentencias simples...');

                // Fallback: solo para seeds que no tengan DO $$ blocks complejos (las preguntas suelen tenerlos)
                // En este caso, casi todas tienen DO $$ blocks.
            }
        } else {
            console.log(`✅ ${seedPath} completado.`);
        }
    }

    console.log('\n🎉 Proceso de seed finalizado.');
}

runSeeds();
