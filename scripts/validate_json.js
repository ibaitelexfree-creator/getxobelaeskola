
const fs = require('fs');
const files = ['es.json', 'eu.json', 'en.json', 'fr.json'];
files.forEach(f => {
    try {
        const content = fs.readFileSync(`./messages/${f}`, 'utf8');
        JSON.parse(content);
        console.log(`${f} is VALID`);
    } catch (e) {
        console.error(`${f} is INVALID:`, e.message);
    }
});
