
const fs = require('fs');
const path = require('path');

const es = JSON.parse(fs.readFileSync(path.join(__dirname, 'messages', 'es.json'), 'utf8'));
const eu = JSON.parse(fs.readFileSync(path.join(__dirname, 'messages', 'eu.json'), 'utf8'));

function getKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            keys = keys.concat(getKeys(obj[key], prefix + key + '.'));
        } else {
            keys.push(prefix + key);
        }
    }
    return keys;
}

const esKeys = getKeys(es);
const euKeys = getKeys(eu);

const missingInEu = esKeys.filter(k => !euKeys.includes(k));
const missingInEs = euKeys.filter(k => !esKeys.includes(k));

console.log(`--- MISSING IN EU (${missingInEu.length}) ---`);
missingInEu.forEach(k => console.log(k));

console.log(`\n--- MISSING IN ES (${missingInEs.length}) ---`);
missingInEs.forEach(k => console.log(k));
