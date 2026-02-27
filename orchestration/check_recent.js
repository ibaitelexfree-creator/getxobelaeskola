
import Database from 'better-sqlite3';
const db = new Database('v3_orchestration.sqlite');
const recent = db.prepare('SELECT id, status, audit_score, created_at FROM missions ORDER BY created_at DESC LIMIT 20').all();
console.log(JSON.stringify(recent, null, 2));
