const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnv() {
    const envPath = path.join(process.cwd(), '.env');
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val) env[key.trim()] = val.join('=').trim().replace(/"/g, '');
    });
    return env;
}

async function run() {
    const env = getEnv();
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    const sqlFile = process.argv[2];
    if (!sqlFile) {
        console.error('Usage: node run_sql.js <sql_file>');
        process.exit(1);
    }

    const sql = fs.readFileSync(sqlFile, 'utf8');

    // We attempt to use an RPC named 'exec_sql' if it exists.
    // If not, this will fail.
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
        console.error('Execution Error:', error);
        // If exec_sql fails, maybe we can try to find if there is another way.
    } else {
        console.log('SQL Executed successfully');
    }
}

run();
