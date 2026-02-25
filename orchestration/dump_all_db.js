
import Database from 'better-sqlite3';
const db = new Database('mission-control.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(JSON.stringify(tables, null, 2));
for (const table of tables) {
    console.log(`Table: ${table.name}`);
    const data = db.prepare(`SELECT * FROM ${table.name}`).all();
    console.log(JSON.stringify(data, null, 2));
}
