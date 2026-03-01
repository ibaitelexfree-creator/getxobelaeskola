import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('OPEN_ROUTER_API_KEY:', process.env.OPEN_ROUTER_API_KEY ? 'DEFINED' : 'UNDEFINED');
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'DEFINED' : 'UNDEFINED');
console.log('Keys starting with OPEN:', Object.keys(process.env).filter(k => k.startsWith('OPEN')));
