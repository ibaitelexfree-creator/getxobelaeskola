
import Database from 'better-sqlite3';
const db = new Database('mission-control.db');
const settings = db.prepare('SELECT * FROM settings').all();
console.log(JSON.stringify(settings, null, 2));
const tasks = db.prepare('SELECT * FROM tasks').all();
console.log(JSON.stringify(tasks, null, 2));
