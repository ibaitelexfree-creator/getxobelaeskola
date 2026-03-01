const fs = require('fs');
try {
    const data = JSON.parse(fs.readFileSync('lighthouse-report.json', 'utf8'));
    const scores = {};
    for (const key in data.categories) {
        scores[key] = data.categories[key].score * 100;
    }
    console.log('--- LIGHTHOUSE SCORES ---');
    console.log(JSON.stringify(scores, null, 2));
    console.log('--- PERFORMANCE METRICS ---');
    const perfAudits = [
        'first-contentful-paint',
        'largest-contentful-paint',
        'speed-index',
        'total-blocking-time',
        'cumulative-layout-shift'
    ];
    perfAudits.forEach(id => {
        const audit = data.audits[id];
        console.log(`${audit.title}: ${audit.displayValue} (${audit.score * 100}%)`);
    });

    console.log('--- LCP ELEMENT ---');
    const lcpElement = data.audits['largest-contentful-paint-element'];
    if (lcpElement && lcpElement.details && lcpElement.details.items) {
        console.log(JSON.stringify(lcpElement.details.items[0].node, null, 2));
    }

    console.log('--- TOP 10 HEAVY ASSETS ---');
    const networkRequests = data.audits['network-requests'];
    if (networkRequests && networkRequests.details && networkRequests.details.items) {
        const topAssets = networkRequests.details.items
            .sort((a, b) => b.resourceSize - a.resourceSize)
            .slice(0, 10);
        topAssets.forEach(asset => {
            console.log(`${(asset.resourceSize / 1024 / 1024).toFixed(2)} MB: ${asset.url}`);
        });
    }

    console.log('--- SEO ISSUES ---');
    const seoCategory = data.categories.seo;
    if (seoCategory && seoCategory.auditRefs) {
        seoCategory.auditRefs.forEach(ref => {
            const audit = data.audits[ref.id];
            if (audit.score !== 1 && audit.score !== null) {
                console.log(`${audit.id}: ${audit.title} - ${audit.explanation || audit.description}`);
            }
        });
    }

    console.log('--- ACCESSIBILITY ISSUES ---');
    const a11yCategory = data.categories.accessibility;
    if (a11yCategory && a11yCategory.auditRefs) {
        a11yCategory.auditRefs.forEach(ref => {
            const audit = data.audits[ref.id];
            if (audit.score !== 1 && audit.score !== null) {
                console.log(`${audit.id}: ${audit.title} - ${audit.description}`);
            }
        });
    }

    console.log('--- BEST PRACTICES ISSUES ---');
    const bpCategory = data.categories['best-practices'];
    if (bpCategory && bpCategory.auditRefs) {
        bpCategory.auditRefs.forEach(ref => {
            const audit = data.audits[ref.id];
            if (audit.score !== 1 && audit.score !== null) {
                console.log(`${audit.id}: ${audit.title} - ${audit.description}`);
            }
        });
    }

} catch (e) {
    console.error('Error parsing lighthouse report:', e.message);
}
