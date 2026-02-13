
const { createClient } = require('@supabase/supabase-js');

async function run() {
    const supabase = createClient(
        'https://xbledhifomblirxurtyv.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibGVkaGlmb21ibGlyeHVydHl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDYyMjE5NywiZXhwIjoyMDg2MTk4MTk3fQ.tynAhTsdBLSv_FI4CbGhWfHLjmfmsl8SJaeiTRDsd_A'
    );

    const tables = ['cursos', 'modulos', 'unidades_didacticas', 'preguntas', 'evaluaciones'];

    for (const table of tables) {
        console.log(`--- Checking table: ${table} ---`);
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.error(error);
        } else if (data && data.length > 0) {
            console.log('Columns:', Object.keys(data[0]).join(', '));
            console.log('Example Row:', JSON.stringify(data[0], null, 2));
        } else {
            console.log(`No data found in ${table}`);
            // Try to get column definition if empty? No easy way via select *
        }
    }
}

run();
