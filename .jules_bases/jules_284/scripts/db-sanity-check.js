const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = fs.readFileSync(envPath, 'utf8');
const env = {};
envConfig.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or keys not found in .env.local');
    process.exit(1);
}

console.log(`URL: ${supabaseUrl}`);
console.log(`Key Length: ${supabaseKey.length}`);
console.log(`Key Type: ${env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON'}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSanityCheck() {
    console.log('--- Database Sanity Check ---');
    console.log(`Connecting to: ${supabaseUrl}`);

    // List all tables first
    const { data: allTables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

    if (tablesError) {
        console.log('Could not list tables (expected if restricted).');
    } else {
        console.log('Available tables:', allTables.map(t => t.table_name).join(', '));
    }

    const tables = ['mensajes_contacto', 'embarcaciones', 'sesiones'];

    for (const table of tables) {
        console.log(`\nChecking table: ${table}...`);
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*');

            if (error) {
                console.error(`Error fetching ${table}:`, error.message);
                continue;
            }

            const testData = data.filter(row => {
                const rowStr = JSON.stringify(row).toLowerCase();
                return rowStr.includes('test-') || rowStr.includes('simulado');
            });

            if (testData.length > 0) {
                console.log(`Found ${testData.length} test/simulated records:`);
                testData.forEach(row => {
                    console.log(`- ID: ${row.id || 'N/A'}, Label/Nombre: ${row.nombre || row.asunto || 'N/A'}`);
                });
            } else {
                console.log('No test data found.');
            }
        } catch (err) {
            console.error(`Unexpected error on ${table}:`, err.message);
        }
    }
    console.log('\n--- Check Complete ---');
}

runSanityCheck();
