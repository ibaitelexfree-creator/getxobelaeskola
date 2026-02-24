import Database from 'better-sqlite3';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(__dirname, 'mission-control.db');

const db = new Database(DB_PATH);

console.log('--- Database Task Summary ---');
const total = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
const running = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status IN ('running', 'en_curso')").get().count;
const completed = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status IN ('completed', 'completado')").get().count;
const pending = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status IN ('pending', 'pendiente')").get().count;

console.log(`Total: ${total}`);
console.log(`Running: ${running}`);
console.log(`Completed: ${completed}`);
console.log(`Pending: ${pending}`);

console.log('\n--- Sample of Running Tasks ---');
const runningSample = db.prepare("SELECT external_id, title FROM tasks WHERE status IN ('running', 'en_curso') LIMIT 20").all();
runningSample.forEach(t => console.log(`- [${t.external_id}] ${t.title.substring(0, 50)}...`));

console.log('\n--- Sample of Pending Tasks ---');
const pendingSample = db.prepare("SELECT external_id, title FROM tasks WHERE status IN ('pending', 'pendiente') LIMIT 10").all();
pendingSample.forEach(t => console.log(`- [${t.external_id}] ${t.title.substring(0, 50)}...`));
