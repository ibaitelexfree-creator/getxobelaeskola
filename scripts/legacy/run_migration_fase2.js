
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
// Load environment variables from .env or .env.local manually
let envPath = path.resolve(__dirname, '.env.local');
let envConfig = {};

if (!fs.existsSync(envPath)) {
    console.log("⚠️ .env.local no encontrado, intentando con .env");
    envPath = path.resolve(__dirname, '.env');
}

try {
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim();
                if (key && value && !key.startsWith('#')) {
                    envConfig[key] = value.replace(/"/g, ''); // Remove quotes if present
                }
            }
        });
    } else {
        console.warn("⚠️ No se encontró archivo .env ni .env.local");
    }
} catch (e) {
    console.warn("⚠️ Error leyendo archivo env, intentando usar process.env: " + e.message);
    envConfig = process.env;
}


const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    console.log('🚀 Ejecutando migración: Fase 2 - Sistema de Progreso\n');

    try {
        // Leer el archivo SQL
        const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20240101000002_academia_fase2_progreso.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('📄 Archivo de migración cargado');
        console.log('⏳ Ejecutando SQL...\n');

        // Intentar ejecutar con exec_sql (si existe)
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            console.log('ℹ️  Función exec_sql no disponible o falló, intentando dividir statements...\n');
            console.error('Error inicial:', error.message);

            // Dividir en statements y ejecutar uno por uno
            // Nota: Esta es una aproximación simple y puede fallar con funciones complejas o strings que contienen ;
            const statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));

            for (let i = 0; i < statements.length; i++) {
                const stmt = statements[i];
                // Ignorar comentarios si es el único contenido
                if (stmt.startsWith('--')) continue;

                console.log(`Ejecutando statement ${i + 1}/${statements.length}...`);

                // Usar RPC 'exec' si existe, o intentar ejecutar de alguna otra manera
                // Si 'exec_sql' falló, es probable que 'exec' también, o que no tengamos permisos.
                // Pero intentemos.
                const { error: stmtError } = await supabase.rpc('exec', { sql: stmt });

                if (stmtError) {
                    console.error(`❌ Error en statement ${i + 1}:`, stmtError.message);
                    // Continuar, ya que algunos errores son "relation already exists"
                }
            }
        }

        console.log('\n✅ Migración finalizada (revisar errores anteriores si los hubo)');
        console.log('\n📊 Verificando datos...\n');

        // Verificar Habilidades
        console.log('--- Habilidades ---');
        const { data: habilidades, error: habError } = await supabase
            .from('habilidades')
            .select('slug, nombre_es, categoria')
            .order('orden_visual');

        if (habError) {
            console.error('❌ Error al consultar habilidades:', habError.message);
        } else {
            console.log(`Total habilidades: ${habilidades.length}`);
            habilidades.forEach(h => console.log(`- ${h.nombre_es} (${h.categoria})`));
        }

        // Verificar Logros
        console.log('\n--- Logros ---');
        const { data: logros, error: logError } = await supabase
            .from('logros')
            .select('slug, nombre_es, puntos, rareza')
            .order('puntos');

        if (logError) {
            console.error('❌ Error al consultar logros:', logError.message);
        } else {
            console.log(`Total logros: ${logros.length}`);
            logros.forEach(l => console.log(`- ${l.nombre_es} (${l.puntos} pts - ${l.rareza})`));
        }

        console.log('\n🎉 Fase 2 completada.\n');

    } catch (error) {
        console.error('❌ Error general:', error.message);
        process.exit(1);
    }
}

runMigration();
