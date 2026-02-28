/**
 * ThermalGuard — CPU/GPU Temperature Monitor & Throttle Controller
 * 
 * Polls system temperatures via PowerShell every 15 seconds.
 * Classifies into zones and controls max concurrent Jules sessions.
 * 
 * Thresholds (from user):
 *   CPU Package:    ideal 70-85°C | acceptable 85-92°C | too_hot 93°C+
 *   GPU Hotspot:    ideal 80-92°C | acceptable 92-96°C | too_hot 97°C+
 *   GPU Temp:       ideal 68-82°C | acceptable 82-86°C | too_hot 87°C+
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { EventEmitter } from 'events';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));

const THRESHOLDS = {
    cpu: { ideal: 85, acceptable: 92, tooHot: 93 },
    gpuHotspot: { ideal: 92, acceptable: 96, tooHot: 97 },
    gpuTemp: { ideal: 82, acceptable: 86, tooHot: 87 }
};

const THROTTLE_LEVELS = {
    ideal: { maxPerAccount: 15, label: '🟢 Ideal', delegate: false },
    acceptable: { maxPerAccount: 8, label: '🟡 Aceptable', delegate: false },
    throttle: { maxPerAccount: 3, label: '🟠 Throttle', delegate: true },
    stop: { maxPerAccount: 0, label: '🔴 STOP', delegate: true }
};

export class ThermalGuard extends EventEmitter {
    constructor(options = {}) {
        super();
        this.pollInterval = options.pollInterval || parseInt(process.env.THERMAL_POLL_INTERVAL) || 60000;
        this.timer = null;
        this.lastTemps = null;
        this.lastLevel = 'ideal';
        this.history = [];
        this.maxHistory = 60; // 15 minutes of data at 15s intervals
        this.useLibreHWM = options.useLibreHWM || false;
        this.libreHWMPath = options.libreHWMPath || 'C:\\Program Files\\LibreHardwareMonitor\\LibreHardwareMonitor.exe';
    }

    /**
     * Read temperatures via PowerShell WMI
     * Falls back to safe defaults if sensors unavailable
     */
    async pollTemps() {
        try {
            const temps = await this._readViaWMI();
            this.lastTemps = temps;

            const prevLevel = this.lastLevel;
            this.lastLevel = this._classifyLevel(temps);

            // Store history
            this.history.push({
                timestamp: Date.now(),
                temps: { ...temps },
                level: this.lastLevel
            });
            if (this.history.length > this.maxHistory) {
                this.history.shift();
            }

            // Emit events on level changes
            if (prevLevel !== this.lastLevel) {
                this.emit('levelChange', {
                    from: prevLevel,
                    to: this.lastLevel,
                    temps,
                    throttle: THROTTLE_LEVELS[this.lastLevel]
                });

                if (this.lastLevel === 'stop') {
                    this.emit('critical', { temps, message: 'Temperatura CRÍTICA. Pausando Jules.' });
                } else if (this.lastLevel === 'throttle') {
                    this.emit('warning', { temps, message: 'Temperatura alta. Reduciendo carga.' });
                } else if (prevLevel === 'stop' || prevLevel === 'throttle') {
                    this.emit('recovered', { temps, message: 'Temperatura normalizada.' });
                }
            }

            return temps;
        } catch (err) {
            console.error('[ThermalGuard] Error polling temps:', err.message);
            return this.lastTemps || { cpu: 0, gpuTemp: 0, gpuHotspot: 0, error: err.message };
        }
    }

    /**
     * Read temperatures using external PowerShell script
     */
    async _readViaWMI() {
        const scriptPath = join(__dirname, '..', 'scripts', 'read-temps.ps1');

        const { stdout } = await execAsync(
            `powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`,
            { timeout: 15000, windowsHide: true }
        );

        const parsed = JSON.parse(stdout.trim());

        return {
            cpu: parsed.cpu !== -1 ? parsed.cpu : null,
            gpuTemp: parsed.gpu !== -1 ? parsed.gpu : null,
            gpuHotspot: parsed.gpuHot !== -1 ? parsed.gpuHot : null,
            timestamp: Date.now()
        };
    }

    /**
     * Classify current temperature into a throttle level
     * Uses worst-case (highest severity) across all sensors
     */
    _classifyLevel(temps) {
        const levels = [];

        if (temps.cpu !== null) {
            if (temps.cpu >= THRESHOLDS.cpu.tooHot) levels.push('stop');
            else if (temps.cpu >= THRESHOLDS.cpu.acceptable) levels.push('throttle');
            else if (temps.cpu >= THRESHOLDS.cpu.ideal) levels.push('acceptable');
            else levels.push('ideal');
        }

        if (temps.gpuHotspot !== null) {
            if (temps.gpuHotspot >= THRESHOLDS.gpuHotspot.tooHot) levels.push('stop');
            else if (temps.gpuHotspot >= THRESHOLDS.gpuHotspot.acceptable) levels.push('throttle');
            else if (temps.gpuHotspot >= THRESHOLDS.gpuHotspot.ideal) levels.push('acceptable');
            else levels.push('ideal');
        }

        if (temps.gpuTemp !== null) {
            if (temps.gpuTemp >= THRESHOLDS.gpuTemp.tooHot) levels.push('stop');
            else if (temps.gpuTemp >= THRESHOLDS.gpuTemp.acceptable) levels.push('throttle');
            else if (temps.gpuTemp >= THRESHOLDS.gpuTemp.ideal) levels.push('acceptable');
            else levels.push('ideal');
        }

        if (levels.length === 0) return 'ideal';

        // Return worst-case level
        const severity = ['ideal', 'acceptable', 'throttle', 'stop'];
        return levels.reduce((worst, l) =>
            severity.indexOf(l) > severity.indexOf(worst) ? l : worst, 'ideal');
    }

    /**
     * Get current throttle level with metadata
     */
    getThrottleLevel() {
        return {
            level: this.lastLevel,
            ...THROTTLE_LEVELS[this.lastLevel],
            temps: this.lastTemps
        };
    }

    /**
     * Get maximum concurrent Jules sessions per account based on current temps
     */
    getMaxConcurrent() {
        return THROTTLE_LEVELS[this.lastLevel].maxPerAccount;
    }

    /**
     * Whether the system should delegate to ClawdeBot
     */
    shouldDelegateToClawdeBot() {
        return THROTTLE_LEVELS[this.lastLevel].delegate;
    }

    /**
     * Get a formatted status string for Telegram
     */
    getStatusMessage() {
        const t = this.lastTemps;
        const level = THROTTLE_LEVELS[this.lastLevel];

        if (!t) return '⏳ Esperando primera lectura de temperatura...';

        const lines = [
            `${level.label} — Nivel de Throttle`,
            '',
            `🖥️ CPU: ${t.cpu !== null ? t.cpu + '°C' : 'N/A'} ${this._getBar(t.cpu, THRESHOLDS.cpu)}`,
            `🎮 GPU: ${t.gpuTemp !== null ? t.gpuTemp + '°C' : 'N/A'} ${this._getBar(t.gpuTemp, THRESHOLDS.gpuTemp)}`,
            `🔥 GPU Hotspot: ${t.gpuHotspot !== null ? t.gpuHotspot + '°C' : 'N/A'} ${this._getBar(t.gpuHotspot, THRESHOLDS.gpuHotspot)}`,
            '',
            `⚡ Max concurrentes/cuenta: ${level.maxPerAccount}`,
            `🤖 ClawdeBot delegación: ${level.delegate ? 'ACTIVO' : 'No necesario'}`
        ];

        return lines.join('\n');
    }

    _getBar(value, thresholds) {
        if (value === null) return '';
        if (value >= thresholds.tooHot) return '🔴';
        if (value >= thresholds.acceptable) return '🟠';
        if (value >= thresholds.ideal) return '🟡';
        return '🟢';
    }

    /**
     * Start periodic polling
     */
    start() {
        if (this.timer) return;
        console.log(`[ThermalGuard] Started polling every ${this.pollInterval / 1000}s`);

        // Initial poll
        this.pollTemps();

        this.timer = setInterval(() => this.pollTemps(), this.pollInterval);
    }

    /**
     * Stop polling
     */
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            console.log('[ThermalGuard] Stopped polling');
        }
    }

    /**
     * Get temperature trend (last 5 readings)
     */
    getTrend() {
        const recent = this.history.slice(-5);
        if (recent.length < 2) return 'stable';

        const cpuTemps = recent.map(h => h.temps.cpu).filter(Boolean);
        if (cpuTemps.length < 2) return 'unknown';

        const diff = cpuTemps[cpuTemps.length - 1] - cpuTemps[0];
        if (diff > 5) return 'rising';
        if (diff < -5) return 'cooling';
        return 'stable';
    }
}

// CLI test mode
if (process.argv.includes('--test')) {
    const guard = new ThermalGuard();
    guard.on('levelChange', (e) => console.log('[ThermalGuard] Level changed:', e));

    console.log('[ThermalGuard] Running test poll...');
    guard.pollTemps().then(temps => {
        console.log('[ThermalGuard] Temps:', temps);
        console.log('[ThermalGuard] Level:', guard.getThrottleLevel());
        console.log('[ThermalGuard] Max concurrent:', guard.getMaxConcurrent());
        console.log('[ThermalGuard] Delegate to ClawdeBot:', guard.shouldDelegateToClawdeBot());
        console.log('[ThermalGuard] Status message:\n', guard.getStatusMessage());
    });
}

export default ThermalGuard;
