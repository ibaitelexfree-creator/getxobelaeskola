
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = Object.fromEntries(fs.readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(p => p.trim())));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: 'SELECT count(*) FROM public.preguntas' });
    console.log('Count from RPC:', data);
    const { data: evCount } = await supabase.rpc('exec_sql', { sql_query: 'SELECT count(*) FROM public.evaluaciones' });
    console.log('Eval Count from RPC:', evCount);
}
run();
