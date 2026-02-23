
const fs = require('fs');
const path = require('path');

const oldDir = 'supabase/migrations_old';
const newDir = 'supabase/migrations';

if (!fs.existsSync(newDir)) fs.mkdirSync(newDir, { recursive: true });

const files = fs.readdirSync(oldDir).filter(f => f.endsWith('.sql')).sort();

// We will use a base timestamp and increment by 1 second for each file to ensure order
let baseTime = new Date('2024-01-01T00:00:00Z').getTime();

const results = [];

files.forEach((file, index) => {
    const timestamp = new Date(baseTime + index * 1000).toISOString()
        .replace(/[-T:Z]/g, '')
        .split('.')[0];

    // Remove old prefix if numeric
    const namePart = file.replace(/^\d+(_)?/, '');
    const newName = `${timestamp}_${namePart}`;

    fs.copyFileSync(path.join(oldDir, file), path.join(newDir, newName));
    results.push({ old: file, new: newName, version: timestamp });
});

fs.writeFileSync('migration_rename_map.json', JSON.stringify(results, null, 2));
console.log(`Renamed ${results.length} migrations into new format.`);
