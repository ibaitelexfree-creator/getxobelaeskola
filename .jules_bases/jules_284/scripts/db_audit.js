const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const fs = require('fs');

(async () => {
    const report = [];

    // 1. Categories
    const { data: cats } = await s.from('categorias').select('*');
    report.push('# DATABASE AUDIT REPORT');
    report.push('');
    report.push('## CATEGORIAS (' + cats.length + ')');
    cats.forEach(c => report.push('- ' + c.slug + ': ' + c.nombre_es + ' / ' + c.nombre_eu));

    // 2. Courses
    const { data: cursos } = await s.from('cursos').select('*');
    report.push('');
    report.push('## CURSOS (' + cursos.length + ')');
    cursos.forEach(c => report.push('- [' + (c.activo ? 'ON' : 'OFF') + '] ' + c.slug + ': ' + c.nombre_es + ' | ' + c.precio + 'EUR | ' + c.duracion_h + 'h'));

    // 3. Rental Services
    const { data: alq } = await s.from('servicios_alquiler').select('*');
    report.push('');
    report.push('## SERVICIOS_ALQUILER (' + alq.length + ')');
    alq.forEach(a => report.push('- [' + (a.activo ? 'ON' : 'OFF') + '] ' + a.slug + ': ' + a.nombre_es + ' | ' + a.precio_base + 'EUR | cat:' + a.categoria));

    // 4. Bonos
    const { data: bonos } = await s.from('tipos_bono').select('*');
    report.push('');
    report.push('## TIPOS_BONO (' + bonos.length + ')');
    bonos.forEach(b => report.push('- [' + (b.activo ? 'ON' : 'OFF') + '] ' + b.nombre + ' | ' + b.precio + 'EUR | ' + b.horas_totales + 'h'));

    const output = report.join('\n');
    fs.writeFileSync('docs/DB_AUDIT.md', output);
    console.log('Report written to docs/DB_AUDIT.md');
    console.log(output);
})();
