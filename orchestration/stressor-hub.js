
import axios from 'axios';
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/stressor_hub.log' })
    ]
});

const ORCHESTRATOR_URL = 'http://localhost:3000/request';
const TELEMETRY_URL = 'http://localhost:3000/api/telemetry';

/**
 * [Stressor Hub]
 * 1. Simulates Burn Variability (±15%) 
 * 2. Injects Semantic Ambiguity (5% requests)
 * 3. Simulates Micro-latency intermitent (100ms-500ms delay)
 */

async function injectStress() {
    logger.info('🚀 [Stressor Hub] Starting controlled pressure cycle...');

    // Frequency: 1 job every 5 seconds to generate controlled noise
    setInterval(async () => {
        const isAmbiguous = Math.random() < 0.05;
        const prompt = isAmbiguous
            ? "Process a vague command with contradictory parameters for testing entropy."
            : "Generic valid mission for expansion testing.";

        try {
            // Simulated jitter in execution request (Micro-latency intermitent)
            if (Math.random() < 0.3) {
                await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
            }

            const response = await axios.post(ORCHESTRATOR_URL, {
                prompt,
                stress_meta: {
                    synthetic_burn: (Math.random() * 0.3 - 0.15), // ±15% variance simulation
                    source: 'STRESSOR_HUB_V1'
                }
            });

            logger.info('Stress job sent', { jobId: response.data.jobId, ambiguous: isAmbiguous });
        } catch (err) {
            logger.error('Failed to send stress job', { error: err.message });
        }
    }, 5000);
}

// Watcher for SSI Fluctuation (Freezes expansion if SSI jumps > 5 in 10 min)
let ssiHistory = [];
setInterval(async () => {
    try {
        const resp = await axios.get(TELEMETRY_URL);
        const currentSsi = resp.data.system.ssi.total;

        ssiHistory.push({ time: Date.now(), val: currentSsi });
        if (ssiHistory.length > 20) ssiHistory.shift();

        if (ssiHistory.length >= 2) {
            const first = ssiHistory[0];
            const last = ssiHistory[ssiHistory.length - 1];
            const diff = Math.abs(last.val - first.val);
            const timeDiffMin = (last.time - first.time) / 60000;

            if (diff > 5 && timeDiffMin <= 10) {
                logger.warn('🚨 SSI FLUCTUATION DETECTED: Freezing expansion.', { diff, timeDiffMin });
                // In a production system, this would hit a Redis flag. 
                // Here, we use a local flag file that Orchestrator reads.
                await import('fs').then(fs => fs.promises.appendFile('logs/expansion_freeze.flag', `FREEZE triggered at ${new Date().toISOString()} | Diff: ${diff}\n`));
            }
        }
    } catch (e) {
        logger.error('SSI Watcher failed', { error: e.message });
    }
}, 30000);

injectStress();
