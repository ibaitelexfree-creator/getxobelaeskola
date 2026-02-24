import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QUOTAS_FILE = path.join(__dirname, '../../data/vercel-quotas.json');

/**
 * VercelMonitor - Tracks Vercel usage and limits
 */
export class VercelMonitor {
    constructor() {
        this.data = this._loadData();
    }

    _loadData() {
        try {
            if (fs.existsSync(QUOTAS_FILE)) {
                return JSON.parse(fs.readFileSync(QUOTAS_FILE, 'utf8'));
            }
        } catch (e) {
            console.error('[VercelMonitor] Failed to load quotas:', e.message);
        }
        return { quotas: {} };
    }

    getStatus() {
        this.data = this._loadData(); // Reload to get manual updates if any
        return this.data;
    }

    /**
     * Get usage percentage for a specific metric
     */
    getUsagePct(key) {
        const q = this.data.quotas[key];
        if (!q) return 0;
        return Math.min((q.used / q.limit) * 100, 100);
    }

    /**
     * Check if any metric is over a warning threshold (e.g. 80%)
     */
    getWarnings(threshold = 80) {
        const warnings = [];
        for (const [key, q] of Object.entries(this.data.quotas)) {
            const pct = (q.used / q.limit) * 100;
            if (pct >= threshold) {
                warnings.push({
                    key,
                    displayName: q.displayName,
                    pct: Math.round(pct),
                    used: q.used,
                    limit: q.limit,
                    unit: q.unit
                });
            }
        }
        return warnings;
    }

    /**
     * Manual update of usage (until API is connected)
     */
    updateUsage(key, used) {
        if (this.data.quotas[key]) {
            this.data.quotas[key].used = used;
            this.data.lastUpdate = new Date().toISOString();
            this._save();
            return true;
        }
        return false;
    }

    _save() {
        try {
            const dataDir = path.dirname(QUOTAS_FILE);
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
            fs.writeFileSync(QUOTAS_FILE, JSON.stringify(this.data, null, 2));
        } catch (e) {
            console.error('[VercelMonitor] Failed to save quotas:', e.message);
        }
    }
}

export default VercelMonitor;
