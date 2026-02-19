
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function exportData() {
    const tables = ['courses', 'embarcaciones', 'instructores', 'mensajes_contacto', 'sesiones', 'skills'];
    const data = {};

    for (const table of tables) {
        const { data: rows, error } = await supabase.from(table).select('*');
        if (error) {
            console.error(`Error fetching ${table}:`, error);
        } else {
            data[table] = rows;
        }
    }

    console.log(JSON.stringify(data, null, 2));
}

exportData();
