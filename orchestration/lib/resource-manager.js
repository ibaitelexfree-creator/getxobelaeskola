import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import http from 'http';
import { VisualRelay } from './visual-relay.js';
import { logs } from './db.js';
import path from 'path';

const execAsync = promisify(exec);

// Initialize visual relay for stats
const visualRelay = new VisualRelay();

// Configuration
const SERVICES = {
    CLAWDEBOT: {
        type: 'docker',
        containerName: 'openclaw-gateway',
        displayName: 'ClawdeBot (Docker)',
        description: 'AI Coding Assistant & Task Executor'
    },
    CHROMA: {
        type: 'docker',
        containerName: 'chromadb',
        displayName: 'ChromaDB',
        description: 'Vector Database for Semantic Memory'
    },
    OLLAMA: {
        type: 'process',
        processName: 'ollama',
        command: 'ollama serve',
        apiCheck: 'http://127.0.0.1:11434/api/tags',
        displayName: 'Ollama LLM',
        description: 'Local Large Language Model Runner'
    },
    BROWSERLESS: {
        type: 'cloud',
        displayName: 'Browserless Cloud',
        description: 'Headless Browser Cluster for Automation'
    },
    WEB_GETXO: {
        type: 'external',
        displayName: 'GetxoBelaEskola.cloud',
        url: 'https://getxobelaeskola.cloud',
        description: 'Main Getxo Bela Eskola Website (Hostinger VPS)'
    },
    N8N: {
        type: 'external',
        displayName: 'n8n Automation',
        url: 'https://n8n.scarmonit.com',
        description: 'Workflow Automation Platform (Hostinger VPS)'
    },
    ORCHESTRATOR: {
        type: 'process',
        displayName: 'Jules Orchestrator',
        description: 'Backend Engine & API Gateway'
    },
    MISSION_CONTROL: {
        type: 'process',
        displayName: 'Mission Control',
        description: 'Web Dashboard & Mission Management',
        command: 'npm run dev', // or npm start
        cwd: 'mission-control',
        apiCheck: 'http://localhost:3100'
    },
    MAIN_APP: {
        type: 'process',
        displayName: 'Main Application',
        description: 'Getxo Bela Eskola Website (Next.js)',
        command: 'npm run dev',
        cwd: '.',
        apiCheck: 'http://localhost:3000'
    }
};

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
let lastActivity = Date.now();
let powerMode = 'eco'; // 'eco' or 'performance'

// In-memory process storage to manage children/logs
const runningProcesses = new Map();

export async function getResourceStatus() {
    const status = {};

    // Check Docker containers
    try {
        const { stdout } = await execAsync('docker ps --format "{{.Names}} ({{.Status}})"', { windowsHide: true });
        const runningContainers = stdout.split('\n').filter(Boolean);

        for (const [key, service] of Object.entries(SERVICES)) {
            if (service.type === 'docker') {
                const containerInfo = runningContainers.find(c => c.startsWith(service.containerName));
                status[key] = {
                    name: service.displayName,
                    running: !!containerInfo && !containerInfo.includes('Paused'),
                    paused: !!containerInfo && containerInfo.includes('Paused'),
                    type: 'docker',
                    description: service.description
                };
            } else if (service.type === 'external') {
                status[key] = {
                    name: service.displayName,
                    running: true, // Always "active" for external dashboard links
                    type: 'external',
                    url: service.url,
                    description: service.description
                };
            }
        }
    } catch (error) {
        console.error('Failed to check docker status:', error.message);
    }

    // Check Processes
    for (const [key, service] of Object.entries(SERVICES)) {
        if (service.type === 'process' && key !== 'ORCHESTRATOR') {
            try {
                const isRunning = runningProcesses.has(key) || (service.apiCheck ? await isUrlResponsive(service.apiCheck) : false);
                status[key] = {
                    name: service.displayName,
                    running: isRunning,
                    type: 'process',
                    description: service.description
                };
            } catch (e) {
                status[key] = { name: service.displayName, running: false, error: e.message };
            }
        }
    }

    // Check Ollama (specific check)
    try {
        const ollamaRunning = await isOllamaRunning();
        status.OLLAMA = {
            name: SERVICES.OLLAMA.displayName,
            running: ollamaRunning,
            type: 'process',
            description: SERVICES.OLLAMA.description
        };
    } catch (error) {
        status.OLLAMA = { running: false, error: error.message };
    }

    // Check Browserless Cloud usage
    try {
        const usage = await visualRelay.getUsage();
        status.BROWSERLESS = {
            name: SERVICES.BROWSERLESS.displayName,
            running: visualRelay.enabled,
            type: 'cloud',
            description: SERVICES.BROWSERLESS.description,
            used: usage?.used || 0,
            limit: usage?.limit || 0,
            remaining: usage?.remaining || 0
        };
    } catch (error) {
        status.BROWSERLESS = { running: false, error: error.message };
    }

    // Check Orchestrator (self)
    status.ORCHESTRATOR = {
        name: SERVICES.ORCHESTRATOR.displayName,
        running: true, // If this code is running, the orchestrator is running
        type: 'process',
        description: SERVICES.ORCHESTRATOR.description
    };

    // Hardware Metrics (Improved)
    const hardware = {
        cpu: { load: 0, temp: 0 },
        gpu: { temp: 0, hotspot: 0, name: 'NVIDIA GPU' }
    };

    try {
        // Query GPU stats via nvidia-smi (removed hotspot as it causes errors on some drivers)
        const { stdout: gpuData } = await execAsync('nvidia-smi --query-gpu=temperature.gpu,gpu_name --format=csv,noheader,nounits', { windowsHide: true });
        const [temp, name] = gpuData.split(',').map(s => s.trim());
        hardware.gpu.temp = parseInt(temp) || 0;
        hardware.gpu.name = name || 'NVIDIA GPU';
    } catch (e) {
        // GPU might not be available or nvidia-smi missing
    }

    try {
        // Use systeminformation for more accurate metrics if available
        const si = await import('systeminformation');
        const cpuLoad = await si.currentLoad();
        const cpuTemp = await si.cpuTemperature();

        hardware.cpu.load = Math.round(cpuLoad.currentLoad) || 0;
        hardware.cpu.temp = Math.round(cpuTemp.main) || 0;

        // If systeminformation failed to get temp (common on Windows without admin), fallback to wmic for load
        if (hardware.cpu.load === 0) {
            const { stdout: cpuData } = await execAsync('wmic cpu get loadpercentage /value', { windowsHide: true });
            const match = cpuData.match(/LoadPercentage=(\d+)/);
            hardware.cpu.load = match ? parseInt(match[1]) : 0;
        }
    } catch (e) {
        // Fallback to simpler methods if systeminformation is not working
        try {
            const { stdout: cpuData } = await execAsync('wmic cpu get loadpercentage /value', { windowsHide: true });
            const match = cpuData.match(/LoadPercentage=(\d+)/);
            hardware.cpu.load = match ? parseInt(match[1]) : 0;
        } catch (innerE) { }
    }

    return {
        powerMode,
        lastActivity: new Date(lastActivity).toISOString(),
        services: status,
        hardware
    };
}

async function isOllamaRunning() {
    return isUrlResponsive(SERVICES.OLLAMA.apiCheck);
}

async function isUrlResponsive(url) {
    return new Promise((resolve) => {
        const timeout = 2000;
        const req = http.get(url, (res) => {
            resolve(res.statusCode >= 200 && res.statusCode < 400);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(timeout, () => {
            req.destroy();
            resolve(false);
        });
    });
}

export async function startService(serviceKey) {
    const service = SERVICES[serviceKey];
    if (!service) throw new Error(`Unknown service: ${serviceKey}`);

    console.log(`Starting service: ${service.displayName}`);

    if (service.type === 'docker') {
        await execAsync(`docker start ${service.containerName}`, { windowsHide: true });
        logs.add(serviceKey, 'START', 'Docker container started');
    } else if (service.type === 'process') {
        if (serviceKey === 'OLLAMA') {
            exec('ollama serve', { windowsHide: true }, (err) => {
                if (err) console.error('Ollama serve exited:', err.message);
            });
            for (let i = 0; i < 10; i++) {
                if (await isOllamaRunning()) return true;
                await new Promise(r => setTimeout(r, 1000));
            }
            throw new Error('Ollama failed to start in time');
        } else if (service.command) {
            // Check if already running in our map
            if (runningProcesses.has(serviceKey)) {
                console.log(`${serviceKey} already managed by us`);
                return true;
            }

            const projectRoot = process.cwd();
            const serviceCwd = service.cwd ? path.resolve(projectRoot, '..', service.cwd) : path.resolve(projectRoot, '..');

            // For Windows, we might need to use shell: true for 'npm'
            const child = spawn('npm.cmd', service.command.split(' ').slice(1), {
                cwd: serviceCwd,
                shell: true,
                detached: false, // We want to track it
                windowsHide: true,
                env: { ...process.env, PORT: service.apiCheck ? new URL(service.apiCheck).port : undefined }
            });

            child.stdout.on('data', (data) => {
                const text = data.toString().trim();
                if (text) {
                    // Filter logs to avoid noise, only save to DB if it looks like an error or important info
                    if (text.toLowerCase().includes('error') || text.toLowerCase().includes('fail')) {
                        logs.add(serviceKey, 'LOG_ERR', text.substring(0, 500));
                    } else if (text.length < 200) {
                        // Minimal logging for info
                    }
                }
            });

            child.stderr.on('data', (data) => {
                const text = data.toString().trim();
                if (text) logs.add(serviceKey, 'LOG_STDERR', text.substring(0, 500));
            });

            child.on('close', (code) => {
                console.log(`${serviceKey} process exited with code ${code}`);
                runningProcesses.delete(serviceKey);
                logs.add(serviceKey, 'EXIT', `Code: ${code}`);
            });

            runningProcesses.set(serviceKey, child);
            logs.add(serviceKey, 'START', `Started with command: ${service.command}`);

            // Wait a bit to see if it crashes immediately
            await new Promise(r => setTimeout(r, 2000));
            return true;
        }
    } else if (service.type === 'cloud') {
        if (serviceKey === 'BROWSERLESS') {
            visualRelay.enabled = true;
            logs.add(serviceKey, 'ENABLE', 'Cloud relay enabled');
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
        await execAsync(`docker stop ${service.containerName}`, { windowsHide: true });
        logs.add(serviceKey, 'STOP', 'Docker container stopped');
    } else if (service.type === 'process') {
        if (serviceKey === 'OLLAMA') {
            try {
                await execAsync('taskkill /F /IM ollama.exe', { windowsHide: true });
            } catch (e) { }
        } else if (runningProcesses.has(serviceKey)) {
            const child = runningProcesses.get(serviceKey);
            // On Windows, killing a process tree is hard with just child.kill()
            try {
                // Try taskkill for the PID and its children
                if (child.pid) {
                    await execAsync(`taskkill /F /T /PID ${child.pid}`, { windowsHide: true });
                } else {
                    child.kill();
                }
            } catch (e) {
                child.kill();
            }
            runningProcesses.delete(serviceKey);
            logs.add(serviceKey, 'STOP', 'Process terminated');
        }
    } else if (service.type === 'cloud') {
        if (serviceKey === 'BROWSERLESS') {
            visualRelay.enabled = false;
        }
    } else if (serviceKey === 'ORCHESTRATOR') {
        logs.add(serviceKey, 'STOP', 'Full system shutdown requested');
        process.exit(0);
    }
    return true;
}

export async function pauseService(serviceKey) {
    const service = SERVICES[serviceKey];
    if (!service) throw new Error(`Unknown service: ${serviceKey}`);

    if (service.type === 'docker') {
        const status = await getResourceStatus();
        if (status.services[serviceKey]?.paused) {
            await execAsync(`docker unpause ${service.containerName}`, { windowsHide: true });
            logs.add(serviceKey, 'UNPAUSE', 'Docker container unpaused');
        } else {
            await execAsync(`docker pause ${service.containerName}`, { windowsHide: true });
            logs.add(serviceKey, 'PAUSE', 'Docker container paused');
        }
        return true;
    }

    // For processes, "pause" is just stop but we might implement it differently later
    // For now, let's just stop it
    return await stopService(serviceKey);
}

export async function getServiceLogs(serviceKey, limit = 50) {
    const allLogs = await logs.getRecent(500);
    return allLogs.filter(l => l.service === serviceKey).slice(0, limit);
}

export async function resetService(serviceKey) {
    console.log(`Resetting service: ${serviceKey}`);
    if (serviceKey === 'ORCHESTRATOR') {
        const { spawn } = await import('child_process');
        const projectRoot = process.cwd();
        // Spawn detached process to restart
        spawn('powershell.exe', [
            '-ExecutionPolicy', 'Bypass',
            '-WindowStyle', 'Minimized',
            '-Command', `Start-Sleep 2; cd "${projectRoot}"; npm start`
        ], {
            detached: true,
            stdio: 'ignore',
            windowsHide: true,
            cwd: path.join(projectRoot, '..')
        }).unref();
        process.exit(0);
    }
    await stopService(serviceKey).catch(() => { });
    await new Promise(r => setTimeout(r, 2000));
    return await startService(serviceKey);
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
