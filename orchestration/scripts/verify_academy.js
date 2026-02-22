
import { VisualRelay } from '../lib/visual-relay.js';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const visualRelay = new VisualRelay();
console.log(`🤖 Bot Token Prefix: ${process.env.TELEGRAM_BOT_TOKEN?.substring(0, 10)}...`);
console.log(`👤 Chat ID: ${process.env.TELEGRAM_CHAT_ID}`);


async function runVerification() {
    console.log('🛡️ Starting Antigravity Batch Verification...');

    // Read the tunnel URL if available, otherwise use default
    const urlFile = resolve(__dirname, '../../antigravity/last_tunnel_url.txt');
    let baseUrl = 'http://localhost:3000';
    if (fs.existsSync(urlFile)) {
        const rawContent = fs.readFileSync(urlFile, 'utf-8');
        // Remove BOM and any leading/trailing whitespace
        const sanitizedContent = rawContent.replace(/^\uFEFF/, '').trim();
        const tunnelData = JSON.parse(sanitizedContent);
        baseUrl = tunnelData.url;
        console.log(`🔗 Using Tunnel URL: ${baseUrl}`);
    }

    const pages = [
        { name: 'Academy Home', path: '/es/academy' },
        { name: 'Wind Lab', path: '/es/wind-lab' },
        { name: 'Nomenclature', path: '/es/nomenclature' },
        { name: 'Logbook', path: '/es/logbook' }
    ];

    for (const page of pages) {
        const url = `${baseUrl}${page.path}`;
        console.log(`📸 Verifying ${page.name}: ${url}...`);
        const result = await visualRelay.screenshotToTelegram(url, `🛡️ **Antigravity Verification: ${page.name}**\nURL: ${url}`);
        if (result.success) {
            console.log(`✅ ${page.name} verified and sent to Telegram.`);
        } else {
            console.warn(`❌ Failed to verify ${page.name}: ${result.error}`);
        }
    }

    console.log('✨ Verification batch complete.');
}

runVerification().catch(console.error);
