import { exec } from 'child_process';
import { promisify } from 'util';
import http from 'http';

const execAsync = promisify(exec);

// Configuration
const SERVICES = {
    CLAWDEBOT: {
        type: 'docker',
        containerName: 'openclaw-gateway',
        displayName: 'ClawdeBot (Docker)'
    },
    CHROMA: {
        type: 'docker',
        containerName: 'chromadb',
        displayName: 'ChromaDB'
    },
    OLLAMA: {
        type: 'process',
        processName: 'ollama',
        command: 'ollama serve',
        apiCheck: 'http://127.0.0.1:11434/api/tags',
        displayName: 'Ollama LLM'
    }
};

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
let lastActivity = Date.now();
let powerMode = 'eco'; // 'eco' or 'performance'

export async function getResourceStatus() {
    const status = {};

    // Check Docker containers
    try {
        const { stdout } = await execAsync('docker ps --format "{{.Names}}"');
        const runningContainers = stdout.split('\n').map(c => c.trim());

        for (const [key, service] of Object.entries(SERVICES)) {
            if (service.type === 'docker') {
                status[key] = {
                    name: service.displayName,
                    running: runningContainers.includes(service.containerName),
                    type: 'docker'
                };
            }
        }
    } catch (error) {
        console.error('Failed to check docker status:', error.message);
    }

    // Check Ollama
    try {
        const ollamaRunning = await isOllamaRunning();
        status.OLLAMA = {
            name: SERVICES.OLLAMA.displayName,
            running: ollamaRunning,
            type: 'process'
        };
    } catch (error) {
        status.OLLAMA = { running: false, error: error.message };
    }

    return {
        powerMode,
        lastActivity: new Date(lastActivity).toISOString(),
        services: status
    };
}

async function isOllamaRunning() {
    return new Promise((resolve) => {
        http.get(SERVICES.OLLAMA.apiCheck, (res) => {
            resolve(res.statusCode === 200);
        }).on('error', () => {
            resolve(false);
        });
    });
}

export async function startService(serviceKey) {
    const service = SERVICES[serviceKey];
    if (!service) throw new Error(`Unknown service: ${serviceKey}`);

    console.log(`Starting service: ${service.displayName}`);

    if (service.type === 'docker') {
        await execAsync(`docker start ${service.containerName}`);
    } else if (service.type === 'process') {
        if (serviceKey === 'OLLAMA') {
            // Start as background process
            exec('ollama serve', (err) => {
                if (err) console.error('Ollama serve exited:', err.message);
            });
            // Wait for it to be ready
            for (let i = 0; i < 10; i++) {
                if (await isOllamaRunning()) return true;
                await new Promise(r => setTimeout(r, 1000));
            }
            throw new Error('Ollama failed to start in time');
        }
    }

    lastActivity = Date.now();
    return true;
}

export async function stopService(serviceKey) {
    const service = SERVICES[serviceKey];
    if (!service) throw new Error(`Unknown service: ${serviceKey}`);

    console.log(`Stopping service: ${service.displayName}`);

    if (service.type === 'docker') {
        await execAsync(`docker stop ${service.containerName}`);
    } else if (service.type === 'process') {
        if (serviceKey === 'OLLAMA') {
            try {
                await execAsync('taskkill /F /IM ollama.exe');
            } catch (e) {
                // Might already be stopped
            }
        }
    }
    return true;
}

export function recordActivity() {
    lastActivity = Date.now();
    if (powerMode === 'eco') {
        // If we are in eco mode, we don't auto-start here, 
        // but individual calls should call ensureServiceUp
    }
}

export async function setPowerMode(mode) {
    if (!['eco', 'performance'].includes(mode)) throw new Error('Invalid mode');
    powerMode = mode;
    return { success: true, mode };
}

export function startInactivityMonitor() {
    setInterval(async () => {
        if (powerMode !== 'eco') return;

        const idleTime = Date.now() - lastActivity;
        if (idleTime > INACTIVITY_TIMEOUT) {
            console.log('Inactivity timeout reached. Shutting down resources...');
            const status = await getResourceStatus();

            if (status.services.CLAWDEBOT?.running) await stopService('CLAWDEBOT');
            if (status.services.OLLAMA?.running) await stopService('OLLAMA');
            // Chroma might be needed for more things, but user said "todo aquello que no sea necesario"
            // If chromadb is only for RAG, it can go down too.
            if (status.services.CHROMA?.running) await stopService('CHROMA');
        }
    }, 60000); // Check every minute
}

export async function ensureServiceUp(serviceKey) {
    recordActivity();
    const status = await getResourceStatus();
    if (!status.services[serviceKey]?.running) {
        await startService(serviceKey);
    }
}
