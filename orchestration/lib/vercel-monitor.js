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
        this.token = process.env.VERCEL_ACCESS_TOKEN;
        this.projectId = process.env.VERCEL_PROJECT_ID || 'prj_CVHwakp0yA70gav5t1xcXC0GGwYz';
        this.teamId = process.env.VERCEL_TEAM_ID || 'team_qsH6nFq6HfVQmrfB3tj03jLU';
        this.pollInterval = null;
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

    /**
     * Attempts to fetch usage data from Vercel API.
     * Note: Vercel does not expose a public REST API for all granular usage metrics yet.
     * This method tests the connection and prepares for their upcoming endpoints/billing SDK.
     */
    async syncFromApi() {
        if (!this.token) {
            console.warn('[VercelMonitor] No VERCEL_ACCESS_TOKEN found. Using manual file quota.');
            return false;
        }

        try {
            // Placeholder: The actual granular limits endpoint is not fully documented.
            // When Vercel releases the public billing SDK query, we will map it here.
            // Example future call: fetch(`https://api.vercel.com/v8/projects/${this.projectId}/usage?teamId=${this.teamId}`)
            const url = `https://api.vercel.com/v9/projects/${this.projectId}?teamId=${this.teamId}`;

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                console.error(`[VercelMonitor] API Error: ${res.status}`);
                return false;
            }

            const data = await res.json();

            // Just outputting to prove connection works:
            // console.log(`[VercelMonitor] Synced project: ${data.name} (Live: ${data.live})`);

            // When usage data is available in the object we map it like this:
            /*
            if (data.usage) {
                this.updateUsage('edge_requests', data.usage.edge_requests);
                this.updateUsage('function_invocations', data.usage.function_invocations);
            }
            */

            return true;
        } catch (error) {
            console.error('[VercelMonitor] Sync Exception:', error.message);
            return false;
        }
    }

    /**
     * Start automatic polling to the Vercel API
     */
    startPolling(intervalMs = 3600000) { // Default: 1 hora
        if (this.pollInterval) clearInterval(this.pollInterval);

        // Initial sync
        this.syncFromApi();

        this.pollInterval = setInterval(() => {
            this.syncFromApi();
        }, intervalMs);

        console.log(`[VercelMonitor] Polling started (${intervalMs}ms)`);
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
