import axios from 'axios';
import https from 'https';

const GRAFANA_URL = process.env.GRAFANA_URL || 'http://orchestrator-grafana:3000';
const GRAFANA_API_KEY = process.env.GRAFANA_API_KEY;

const grafanaClient = axios.create({
    baseURL: GRAFANA_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    // Useful for self-signed certs in dev (not strictly needed for HTTP but good to have)
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
});

if (GRAFANA_API_KEY) {
    grafanaClient.defaults.headers.common['Authorization'] = `Bearer ${GRAFANA_API_KEY}`;
} else {
    // If no API key, we try with Basic Auth (assuming admin:admin for local dev)
    const basicAuth = Buffer.from('admin:admin').toString('base64');
    grafanaClient.defaults.headers.common['Authorization'] = `Basic ${basicAuth}`;
}

/**
 * Creates a Grafana dashboard snapshot using the Grafana API.
 * @param {string} dashboardUid - The UID of the dashboard to snapshot.
 * @returns {Promise<string>} - The URL of the created snapshot.
 */
export async function createDashboardSnapshot(dashboardUid) {
    try {
        // Sanitize dashboardUid to prevent traversal or injection
        if (!/^[a-zA-Z0-9_-]+$/.test(dashboardUid)) {
             throw new Error('Invalid dashboard UID');
        }

        const safeUid = encodeURIComponent(dashboardUid);
        console.log(`[Grafana] Creating snapshot for dashboard: ${safeUid}`);

        // 1. Fetch dashboard JSON definition
        const dbResp = await grafanaClient.get(`/api/dashboards/uid/${safeUid}`);
        const dashboard = dbResp.data.dashboard;

        // Remove `id` to avoid conflict as recommended by Grafana API
        delete dashboard.id;

        // 2. Create the snapshot
        const snapshotResp = await grafanaClient.post('/api/snapshots', {
            dashboard: dashboard,
            expires: 3600 * 24, // Expires in 24 hours
            external: false // Create local snapshot instead of external raintank.io
        });

        // The URL returned might be a relative or absolute path depending on Grafana's `server.root_url` config.
        let url = snapshotResp.data.url;

        // If it's a relative URL, prepend the base domain/IP for accessibility.
        if (url.startsWith('/')) {
            // In a real setup, this would be your public Grafana domain.
            // Here we use the public IP/Domain if available, or just localhost for testing.
            url = `http://localhost:3001${url}`;
        }

        console.log(`[Grafana] Snapshot created successfully: ${url}`);
        return url;
    } catch (error) {
        console.error('[Grafana Snapshot Error]:', error.response?.data?.message || error.message);
        // Fallback to the dashboard URL rather than crashing the notification
        console.warn('[Grafana] Falling back to default dashboard link');
        const safeUidFallback = dashboardUid ? encodeURIComponent(dashboardUid) : 'unknown';
        return `http://localhost:3001/d/${safeUidFallback}`;
    }
}
