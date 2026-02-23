
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer .env.local manualmente
const envPath = path.join(__dirname, '.env.local');
let env = {};
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value.length > 0) env[key.trim()] = value.join('=').trim().replace(/"/g, '').replace(/'/g, '');
    });
} catch (e) {
    console.warn('.env.local not found, trying .env');
    const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value.length > 0) env[key.trim()] = value.join('=').trim().replace(/"/g, '').replace(/'/g, '');
    });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLS() {
    console.log('Checking RLS policies for: reservas_alquiler, inscripciones, profiles\n');

    const checkTablesSql = `
        SELECT tablename, rowsecurity
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename IN ('reservas_alquiler', 'inscripciones', 'profiles');
    `;

    const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', { sql: checkTablesSql });
    if (tablesError) {
        // Try other parameter name
        const { data: tables2, error: tablesError2 } = await supabase.rpc('exec_sql', { sql_query: checkTablesSql });
        if (tablesError2) {
            console.error('Error checking tables:', tablesError2);
        } else {
            console.log('Table RLS Status:');
            console.table(tables2);
        }
    } else {
        console.log('Table RLS Status:');
        console.table(tables);
    }

    const checkPoliciesSql = `
        SELECT tablename, policyname, cmd, qual, with_check
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN ('reservas_alquiler', 'inscripciones', 'profiles');
    `;

    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', { sql: checkPoliciesSql });
    if (policiesError) {
        const { data: policies2, error: policiesError2 } = await supabase.rpc('exec_sql', { sql_query: checkPoliciesSql });
        if (policiesError2) {
            console.error('Error checking policies:', policiesError2);
        } else {
            console.log('\nPolicies:');
            console.table(policies2);
        }
    } else {
        console.log('\nPolicies:');
        console.table(policies);
    }
}

checkRLS();
