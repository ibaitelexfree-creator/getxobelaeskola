import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import db from './db-client.js';
import { sendTelegramMessage } from '../telegram.js';

// The expected manifest hash for production (can be generated and stored securely)
// This should match the hash of your critical manifest file (e.g. n8n workflows or a system config).
const EXPECTED_MANIFEST_HASH = process.env.EXPECTED_MANIFEST_HASH || 'bypass_dev_mode';

export async function captureIntegritySnapshot() {
    console.log('🛡️ [INTEGRITY] Capturing Daily Integrity Snapshot...');

    try {
        // Here we read our central manifest or crucial source file to hash it
        // As an example, we hash package.json + main index as a stand-in for a generic "manifest"
        const indexJs = fs.readFileSync(path.join(process.cwd(), 'src', 'index.js'), 'utf8');
        const pkgJson = fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8');

        // Calculate Global Hash
        const globalHash = crypto.createHash('sha256').update(indexJs + pkgJson).digest('hex');

        let valid = false;
        if (EXPECTED_MANIFEST_HASH === 'bypass_dev_mode' || globalHash === EXPECTED_MANIFEST_HASH) {
            valid = true;
        }

        console.log(`🛡️ [INTEGRITY] Hash: ${globalHash} | Valid: ${valid}`);

        // Save snapshot
        await db.query(`
            INSERT INTO sw2_integrity_snapshots (manifest_hash, signature_valid)
            VALUES ($1, $2)
        `, [globalHash, valid]);

        if (!valid) {
            console.error(`🚨 [INTEGRITY] MANIFEST HASH MISMATCH! Expected: ${EXPECTED_MANIFEST_HASH}, Got: ${globalHash}`);
            await sendTelegramMessage(`🚨 *ALERTA FORENSE:* Cambios de integridad detectados fuera del pipeline.\nHash actual: \`${globalHash}\``);
        }

        return { globalHash, valid };

    } catch (error) {
        console.error('❌ [INTEGRITY] Snaphot Error:', error.message);
    }
}
