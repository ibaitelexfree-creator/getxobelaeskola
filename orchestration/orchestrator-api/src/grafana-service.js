import axios from 'axios';
<<<<<<< HEAD

const GRAFANA_URL = process.env.GRAFANA_URL || 'http://orchestrator-grafana:3000';
const GRAFANA_API_KEY = process.env.GRAFANA_API_KEY;

const grafanaClient = axios.create({
    baseURL: GRAFANA_URL,
    headers: {
        'Authorization': `Bearer ${GRAFANA_API_KEY}`,
        'Content-Type': 'application/json'
    }
});

=======
import https from 'https';

const GRAFANA_URL = process.env.GRAFANA_URL || 'http://orchestrator-grafana:3000';
const GRAFANA_API_KEY = process.env.GRAFANA_API_KEY; // Optional depending on auth setup in Grafana

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
>>>>>>> 4d18bac (100 pull requests into main)
export async function createDashboardSnapshot(dashboardUid) {
    try {
        console.log(`[Grafana] Creating snapshot for dashboard: ${dashboardUid}`);

<<<<<<< HEAD
        // 1. Get dashboard JSON
        const dbResp = await grafanaClient.get(`/api/dashboards/uid/${dashboardUid}`);
        const dashboard = dbResp.data.dashboard;

        // Remove ID to avoid conflict
        delete dashboard.id;

        // 2. Post snapshot
        const snapshotResp = await grafanaClient.post('/api/snapshots', {
            dashboard: dashboard,
            expires: 3600 * 24, // 24 hours
            external: false
        });

        // The URL returned is usually local to the container, we might need to adjust it
        let url = snapshotResp.data.url;

        // If it returns a localhost URL from inside the container, we might need a public one
        // But for now, we return what it gives. 
        // Note: The orchestrator root URL fix in compose should help.

        return url;
    } catch (error) {
        console.error('[Grafana Snapshot] Error:', error.response?.data || error.message);
        throw error;
=======
        // 1. Fetch dashboard JSON definition
        const dbResp = await grafanaClient.get(`/api/dashboards/uid/${dashboardUid}`);
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
        return `http://localhost:3001/d/${dashboardUid}`;
>>>>>>> 4d18bac (100 pull requests into main)
    }
}
