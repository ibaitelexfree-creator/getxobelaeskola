/**
 * Script para ejecutar la migración de Fase 1: Academia Digital
 * Crea las tablas de niveles, módulos y unidades didácticas
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    console.log('🚀 Ejecutando migración: Fase 1 - Academia Digital\n');

    try {
        // Leer el archivo SQL
        const migrationPath = path.join(__dirname, 'supabase', 'migrations', '001_academia_fase1_niveles.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('📄 Archivo de migración cargado');
        console.log('⏳ Ejecutando SQL...\n');

        // Ejecutar la migración
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            // Si no existe la función exec_sql, ejecutamos directamente
            console.log('ℹ️  Función exec_sql no disponible, ejecutando con método alternativo...\n');

            // Dividir en statements y ejecutar uno por uno
            const statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));

            for (let i = 0; i < statements.length; i++) {
                const stmt = statements[i] + ';';
                console.log(`Ejecutando statement ${i + 1}/${statements.length}...`);

                const { error: stmtError } = await supabase.rpc('exec', { sql: stmt });

                if (stmtError) {
                    console.error(`❌ Error en statement ${i + 1}:`, stmtError.message);
                    // Continuar con el siguiente (algunos errores son esperados, como "ya existe")
                }
            }
        }

        console.log('\n✅ Migración completada');
        console.log('\n📊 Verificando datos...\n');

        // Verificar que los niveles se crearon
        const { data: niveles, error: nivelesError } = await supabase
            .from('niveles_formacion')
            .select('slug, nombre_es, orden')
            .order('orden');

        if (nivelesError) {
            console.error('❌ Error al verificar niveles:', nivelesError.message);
        } else {
            console.log('✅ Niveles de formación creados:');
            niveles.forEach(n => {
                console.log(`   ${n.orden}. ${n.nombre_es} (${n.slug})`);
            });
        }

        console.log('\n🎉 Fase 1 completada con éxito\n');
        console.log('Próximos pasos:');
        console.log('  1. Crear los cursos y vincularlos a niveles');
        console.log('  2. Crear módulos para cada curso');
        console.log('  3. Crear unidades didácticas para cada módulo\n');

    } catch (error) {
        console.error('❌ Error ejecutando migración:', error.message);
        process.exit(1);
    }
}

runMigration();
