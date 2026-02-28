import Database from 'better-sqlite3';
import { resolve } from 'path';

const DB_PATH = resolve('orchestration/mission-control.db');
const db = new Database(DB_PATH);

try {
    const logs = db.prepare("SELECT * FROM service_logs ORDER BY timestamp DESC LIMIT 20").all();
    console.log(JSON.stringify(logs, null, 2));
} catch (e) {
    console.error('Error reading logs:', e.message);
}
db.close();
