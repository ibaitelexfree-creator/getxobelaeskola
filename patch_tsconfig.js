const fs = require('fs');
const file = 'tsconfig.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!data.exclude.includes('apps')) {
    data.exclude.push('apps');
}
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
console.log('Added apps to exclude in tsconfig.json');
