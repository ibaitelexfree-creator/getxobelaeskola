import axios from 'axios';

const GRAFANA_URL = process.env.GRAFANA_URL || 'http://orchestrator-grafana:3000';
const GRAFANA_API_KEY = process.env.GRAFANA_API_KEY;

const grafanaClient = axios.create({
    baseURL: GRAFANA_URL,
    headers: {
        'Authorization': `Bearer ${GRAFANA_API_KEY}`,
        'Content-Type': 'application/json'
    }
});

export async function createDashboardSnapshot(dashboardUid) {
    try {
        console.log(`[Grafana] Creating snapshot for dashboard: ${dashboardUid}`);

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
    }
}
