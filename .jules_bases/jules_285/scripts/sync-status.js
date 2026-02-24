
const fs = require('fs');
const tableMap = JSON.parse(fs.readFileSync('scripts/table_to_notion_map.json', 'utf8'));

async function checkStatus() {
    console.log('--- NOTION SYNC STATUS ---');
    for (const [table, dbId] of Object.entries(tableMap)) {
        // We'll just list the map for now as a reference
        console.log(`${table.padEnd(25)} -> ${dbId}`);
    }
}

checkStatus();
