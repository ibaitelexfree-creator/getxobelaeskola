
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = Object.fromEntries(fs.readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(p => p.trim())));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data, error } = await supabase.from('evaluaciones').select('*').limit(1);
    if (error) {
        console.error('Error fetching evaluacion:', error.message);
        // Try getting column names via another method if empty
        const { data: cols } = await supabase.rpc('inspect_table', { table_name: 'evaluaciones' });
        console.log('Cols via inspect_table:', cols);
    } else if (data && data.length > 0) {
        console.log('Columns in evaluaciones:', Object.keys(data[0]));
    } else {
        console.log('Table evaluaciones is empty.');
    }
}
run();
