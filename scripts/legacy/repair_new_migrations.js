
const fs = require('fs');
const { execSync } = require('child_process');

const map = JSON.parse(fs.readFileSync('migration_rename_map.json', 'utf8'));

console.log('--- Repairing remote migration history ---');

map.forEach((m, index) => {
    console.log(`[${index + 1}/${map.length}] Sincronizando ${m.version} (${m.new})`);
    try {
        execSync(`npx supabase migration repair --status applied ${m.version}`, { stdio: 'inherit' });
    } catch (e) {
        console.error(`Error repairing ${m.version}:`, e.message);
    }
});

console.log('--- Done! ---');
