
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envLocalPath = path.join(process.cwd(), '.env.local');
    const envPath = path.join(process.cwd(), '.env');
    let content = '';
    if (fs.existsSync(envLocalPath)) content = fs.readFileSync(envLocalPath, 'utf8');
    else if (fs.existsSync(envPath)) content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) process.env[key.trim()] = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1');
    });
}
loadEnv();

async function introspect() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    console.log('--- INSCRIPCIONES COLUMNS ---');
    const { data: insCols, error: insColError } = await supabase.from('inscripciones').select('*').limit(1);
    if (insCols && insCols.length > 0) {
        console.log('Inscripciones columns:', Object.keys(insCols[0]));
    } else if (insColError) {
        console.log('Error fetching inscripciones:', insColError.message);
    } else {
        console.log('Inscripciones table empty but exists?');
        // Try to get columns even if empty by tricking it or checking a specific ID if known
    }

    // List ALL tables if possible using information_schema
    const { data: allTables, error: allTablesError } = await supabase.rpc('get_table_names'); // maybe this one exists?
    if (allTablesError) {
        // Last resort: query information_schema directly if possible.
        // Some supabase setups allow it with service role.
        const { data: infoTables, error: infoError } = await supabase.from('pg_tables').select('tablename').eq('schemaname', 'public');
        // wait, pg_tables isnt usually exposed as a table view in PostgREST unless configured.
    }
}

introspect();
