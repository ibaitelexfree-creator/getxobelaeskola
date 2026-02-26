import https from 'https';
import fs from 'fs';

const token = "8695427396:AAEEAoHvbDTEQ2AHkqIcmKNtJ76IqVrIicI";
let lastId = 0;

console.log("Starting aggressive monitor...");

async function poll() {
    const data = JSON.stringify({ offset: lastId + 1, timeout: 5 });
    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${token}/getUpdates`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let buf = '';
            res.on('data', c => buf += c);
            res.on('end', () => resolve(JSON.parse(buf)));
        });
        req.on('error', () => resolve({ ok: false }));
        req.write(data);
        req.end();
    });
}

const start = Date.now();
while (Date.now() - start < 60000) {
    const res = await poll();
    if (res.ok && res.result.length > 0) {
        for (const up of res.result) {
            lastId = up.update_id;
            const log = `[${new Date().toISOString()}] Update ${up.update_id}: ${JSON.stringify(up)}\n`;
            fs.appendFileSync('telegram_monitor.log', log);
            console.log(log);
        }
    } else if (!res.ok && res.error_code === 409) {
        console.log("Conflict, retrying...");
    }
    await new Promise(r => setTimeout(r, 1000));
}
