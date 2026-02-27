import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Shared Client for n8n API interactions
 */
export class N8nClient {
    /**
     * Triggers a workflow by URL with provided payload
     */
    static async triggerWorkflow(urlKey, payload) {
        const url = process.env[urlKey];
        if (!url) {
            console.warn(`⚠️ URL for ${urlKey} not found in .env`);
            return null;
        }

        try {
            console.log(`[n8n] Triggering workflow: ${urlKey}`);
            const response = await axios.post(url, payload, {
                timeout: 300000, // 5 min
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`[n8n] Error triggering ${urlKey}:`, error.message);
            throw error;
        }
    }

    /**
     * Integrated RateGuard via n8n (Optional optimization)
     */
    static async checkRateLimit(model, taskId) {
        return this.triggerWorkflow('N8N_RATE_GUARD_URL', { model, taskId });
    }
}

export default N8nClient;
