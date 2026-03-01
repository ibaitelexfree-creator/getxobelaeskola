const fs = require('fs');

try {
    const report = JSON.parse(fs.readFileSync('report.json', 'utf8'));

    const scores = {
        Performance: report.categories.performance?.score * 100,
        Accessibility: report.categories.accessibility?.score * 100,
        BestPractices: report.categories['best-practices']?.score * 100,
        SEO: report.categories.seo?.score * 100
    };

    console.log('=== PUNTUACIONES (0-100) ===');
    console.table(scores);

    const auditsToCheck = [
        'landmark-one-main',
        'canonical',
        'errors-in-console',
        'largest-contentful-paint',
        'largest-contentful-paint-element'
    ];

    console.log('\n=== AUDITORÍAS ESPECÍFICAS ===');
    auditsToCheck.forEach(id => {
        const audit = report.audits[id];
        if (audit) {
            console.log(`\n• [${id}] -> Puntuación: ${audit.score ?? 'N/A'}, Valor: ${audit.displayValue ?? 'N/A'}`);
            if (audit.details && audit.details.items && audit.details.items.length > 0) {
                console.log('Detalles:');
                console.dir(audit.details.items.slice(0, 3), { depth: null });
            }
        } else {
            console.log(`\n• [${id}] -> No encontrado en el reporte.`);
        }
    });
} catch (e) {
    console.error("Error leyendo report.json:", e.message);
}
