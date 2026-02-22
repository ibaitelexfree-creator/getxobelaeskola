import VisualRelay from './lib/visual-relay.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    const relay = new VisualRelay();
    // Use the latest tunnel URL from the file
    let tunnelUrl = 'http://127.0.0.1:3323';
    try {
        const fs = await import('fs');
        const path = await import('path');
        const tunnelFile = path.join(process.cwd(), '..', 'antigravity', 'last_tunnel_url.txt');
        if (fs.existsSync(tunnelFile)) {
            const data = JSON.parse(fs.readFileSync(tunnelFile, 'utf8'));
            tunnelUrl = data.url;
        }
    } catch (e) {
        console.error('Could not read tunnel file:', e.message);
    }

    console.log('[Test] Testing screenshot TO TELEGRAM with 3s WAIT of tunnel URL:', tunnelUrl);
    // Explicitly set wait to 5s for this test to be sure
    const result = await relay.screenshotToTelegram(tunnelUrl, `📸 Delayed Test: ${tunnelUrl}\nWait: 3000ms (default)`);

    if (result.success) {
        console.log('✅ Telegram send successful!', result.message);
    } else {
        console.error('❌ Telegram send failed:', result.error);
    }
}

test();
